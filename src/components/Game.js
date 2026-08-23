import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SCREEN } from "../constants/game";
import { useGame } from "../hooks/useGame";
import { applyWebViewport } from "../web/fullscreen";
import { Player } from "./entities/Player";
import { Meteor } from "./entities/Meteor";
import { Laser } from "./entities/Laser";
import { EnemyShip } from "./entities/EnemyShip";
import { EnemyLaser } from "./entities/EnemyLaser";
import { Missile } from "./entities/Missile";
import { PowerUp } from "./entities/PowerUp";
import { Drone } from "./entities/Drone";
import { EmpBurst } from "./fx/EmpBurst";
import { BossBurst } from "./fx/BossBurst";
import { SpaceBackground } from "./fx/SpaceBackground";
import { StageBanner } from "./fx/StageBanner";
import { Hud } from "./hud/Hud";
import { UltimateButton } from "./hud/UltimateButton";
import { StartScreen } from "./screens/StartScreen";
import { GameOverScreen } from "./screens/GameOverScreen";
import { PauseScreen } from "./screens/PauseScreen";

export function Game() {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const arenaRef = useRef(null);
  const game = useGame(layout);
  const playing = game.hud.screen === SCREEN.PLAYING;
  const paused = playing && game.hud.paused;
  const shake = game.shake || { x: 0, y: 0 };

  useEffect(() => {
    applyWebViewport();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return undefined;
    const sync = () => {
      const vv = window.visualViewport;
      const width = Math.round(vv?.width || window.innerWidth || 0);
      const height = Math.round(vv?.height || window.innerHeight || 0);
      if (width < 8 || height < 8) return;
      setLayout((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      );
    };
    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return undefined;
    const onKey = (e) => {
      if (e.code === "Escape") {
        e.preventDefault();
        game.togglePause();
        return;
      }
      if (e.code === "KeyQ" || e.key === "q" || e.key === "Q") {
        if (e.repeat) return;
        e.preventDefault();
        game.fireUltimate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game]);

  const moveFromPointer = useCallback(
    (localX, localY, fromTouch) => {
      if (game.hud.screen === SCREEN.PLAYING) {
        game.movePlayerTo(localX, localY, fromTouch);
      }
    },
    [game]
  );

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => moveFromPointer(e.x, e.y, true))
    .onChange((e) => moveFromPointer(e.x, e.y, true));

  const tap = Gesture.Tap().runOnJS(true).onEnd(() => {
    if (game.hud.screen === SCREEN.PLAYING) game.fireMissile();
  });

  const onWebPointerMove = useCallback(
    (e) => {
      if (Platform.OS !== "web" || game.hud.screen !== SCREEN.PLAYING) return;
      if (e.buttons === 0 && e.type !== "mousemove") return;
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect?.();
      if (!rect) return;
      const clientX = e.nativeEvent?.clientX ?? e.clientX;
      const clientY = e.nativeEvent?.clientY ?? e.clientY;
      if (typeof clientX !== "number") return;
      const touch = e.pointerType === "touch" || e.nativeEvent?.pointerType === "touch";
      moveFromPointer(clientX - rect.left, clientY - rect.top, touch);
    },
    [game.hud.screen, moveFromPointer]
  );

  return (
    <View
      ref={arenaRef}
      style={styles.arena}
      onLayout={(e) => {
        if (Platform.OS === "web" && typeof window !== "undefined" && window.visualViewport) {
          return;
        }
        setLayout(e.nativeEvent.layout);
      }}
    >
      <GestureDetector gesture={Gesture.Race(pan, tap)}>
        <View
          style={[
            styles.playfield,
            { transform: [{ translateX: shake.x }, { translateY: shake.y }] },
          ]}
          {...(Platform.OS === "web"
            ? {
                onMouseMove: onWebPointerMove,
                onMouseDown: onWebPointerMove,
                onClick: (e) => {
                  if (game.hud.screen !== SCREEN.PLAYING) return;
                  e.preventDefault?.();
                  game.fireMissile();
                },
                onTouchMove: (e) => {
                  const t = e.nativeEvent?.touches?.[0] || e.nativeEvent;
                  const rect = e.currentTarget.getBoundingClientRect?.();
                  if (!rect || typeof t.clientX !== "number") return;
                  moveFromPointer(
                    t.clientX - rect.left,
                    t.clientY - rect.top,
                    true
                  );
                },
              }
            : {})}
        >
          <SpaceBackground
            scrollY={Math.floor(game.scrollY / 3)}
            level={game.hud.stage || game.hud.level}
            score={game.hud.score}
            playing={playing}
          />

          {playing && (
            <>
              <Hud
                score={game.hud.score}
                lives={game.hud.lives}
                level={game.hud.level}
                stage={game.hud.stage}
                phase={game.hud.phase}
                spawned={game.hud.spawned}
                quota={game.hud.quota}
                shielded={game.hud.shielded}
                shieldHp={game.hud.shieldHp}
                weaponLevel={game.hud.weaponLevel}
                droneCount={game.hud.droneCount}
                missiles={game.hud.missiles}
              />
              <StageBanner
                title={game.hud.banner}
                subtitle={game.hud.bannerSub}
              />
              {game.lasers.map((laser) => (
                <Laser key={laser.id} {...laser} />
              ))}
              {game.meteors.map((meteor) => (
                <Meteor key={meteor.id} {...meteor} />
              ))}
              {game.enemies.map((enemy) => (
                <EnemyShip key={enemy.id} {...enemy} />
              ))}
              {game.enemyLasers.map((laser) => (
                <EnemyLaser key={laser.id} {...laser} />
              ))}
              {(game.missiles || []).map((missile) => (
                <Missile key={missile.id} {...missile} />
              ))}
              {game.powerups.map((drop) => (
                <PowerUp key={drop.id} {...drop} />
              ))}
              {(game.drones || []).map((drone) => (
                <Drone key={drone.id} {...drone} />
              ))}
              <Player {...game.player} />
              <EmpBurst burst={game.empBurst} />
              <BossBurst burst={game.bossBurst} />
            </>
          )}
        </View>
      </GestureDetector>

      {playing ? (
        <UltimateButton
          charge={game.hud.ultimate || 0}
          onPress={game.fireUltimate}
        />
      ) : null}

      {paused ? (
        <PauseScreen onResume={game.resumeGame} onQuit={game.goToStart} />
      ) : null}

      {game.hud.screen === SCREEN.START && (
        <StartScreen
          leaderboard={game.hud.leaderboard}
          shipId={game.shipId}
          onSelectShip={game.setShipId}
          onStart={game.startGame}
        />
      )}

      {game.hud.screen === SCREEN.GAME_OVER && (
        <GameOverScreen
          score={game.hud.score}
          level={game.hud.stage || game.hud.level}
          leaderboard={game.hud.leaderboard}
          scoreSaved={game.hud.scoreSaved}
          defaultName={game.playerName}
          onSave={game.saveRun}
          onReplay={game.goToStart}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  arena: {
    flex: 1,
    width: "100%",
    height: Platform.OS === "web" ? "100dvh" : "100%",
    minHeight: Platform.OS === "web" ? "100dvh" : undefined,
    backgroundColor: "#030712",
    overflow: "hidden",
    cursor: Platform.OS === "web" ? "default" : undefined,
  },
  playfield: {
    flex: 1,
    width: "100%",
    height: "100%",
    cursor: Platform.OS === "web" ? "none" : undefined,
  },
});
