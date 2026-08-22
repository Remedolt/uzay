import { useCallback, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SCREEN } from "../constants/game";
import { useGame } from "../hooks/useGame";
import { Player } from "./entities/Player";
import { Meteor } from "./entities/Meteor";
import { Laser } from "./entities/Laser";
import { EnemyShip } from "./entities/EnemyShip";
import { EnemyLaser } from "./entities/EnemyLaser";
import { Missile } from "./entities/Missile";
import { PowerUp } from "./entities/PowerUp";
import { SpaceBackground } from "./fx/SpaceBackground";
import { StageBanner } from "./fx/StageBanner";
import { Hud } from "./hud/Hud";
import { StartScreen } from "./screens/StartScreen";
import { GameOverScreen } from "./screens/GameOverScreen";

export function Game() {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const arenaRef = useRef(null);
  const game = useGame(layout);

  const moveFromLocalX = useCallback(
    (localX) => {
      if (game.hud.screen === SCREEN.PLAYING) game.movePlayerTo(localX);
    },
    [game]
  );

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => moveFromLocalX(e.x))
    .onChange((e) => moveFromLocalX(e.x));

  const tap = Gesture.Tap().runOnJS(true).onEnd(() => {
    if (game.hud.screen === SCREEN.PLAYING) game.fire();
  });

  const onWebPointerMove = useCallback(
    (e) => {
      if (Platform.OS !== "web" || game.hud.screen !== SCREEN.PLAYING) return;
      if (e.buttons === 0 && e.type !== "mousemove") return;
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect?.();
      if (!rect) return;
      const clientX = e.nativeEvent?.clientX ?? e.clientX;
      if (typeof clientX !== "number") return;
      moveFromLocalX(clientX - rect.left);
    },
    [game.hud.screen, moveFromLocalX]
  );

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View
        ref={arenaRef}
        style={styles.arena}
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
        {...(Platform.OS === "web"
          ? {
              onMouseMove: onWebPointerMove,
              onMouseDown: onWebPointerMove,
            }
          : {})}
      >
        <SpaceBackground
          scrollY={Math.floor(game.scrollY / 3)}
          level={game.hud.stage || game.hud.level}
          score={game.hud.score}
          playing={game.hud.screen === SCREEN.PLAYING}
        />

        {game.hud.screen === SCREEN.PLAYING && (
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
              weaponLevel={game.hud.weaponLevel}
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
            <Player {...game.player} />
          </>
        )}

        {game.hud.screen === SCREEN.START && (
          <StartScreen
            highScore={game.hud.highScore}
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
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  arena: {
    flex: 1,
    width: "100%",
    height: "100%",
    minHeight: Platform.OS === "web" ? "100vh" : undefined,
    backgroundColor: "#030712",
    overflow: "hidden",
    cursor: Platform.OS === "web" ? "crosshair" : undefined,
  },
});
