import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { PetAvatar } from "./PetAvatar";
import type { Pet } from "../domain/types";
import { colors, radius } from "../theme";

export type CatAnimationName =
  | "Happy_Idle"
  | "Happy_Success"
  | "Idle_Default"
  | "Sad"
  | "Sad_Idle"
  | "Sad_To_Normal";

interface Cat3DViewerProps {
  pet?: Pet;
  animation?: CatAnimationName;
  size?: number;
  width?: number | string;
  height?: number | string;
  cameraDistance?: number;
  cameraY?: number;
  cameraLookAtY?: number;
  modelY?: number;
  autoRotate?: boolean;
  interactive?: boolean;
  showRug?: boolean;
  onPetTouch?: () => void;
  onAnimationEnd?: (name: CatAnimationName) => void;
  style?: StyleProp<ViewStyle>;
}

export function Cat3DViewer({
  pet,
  animation,
  size = 380,
  width = "100%",
  height,
  cameraDistance = 2.85,
  cameraY = 1.05,
  cameraLookAtY = 0.72,
  modelY = 0,
  autoRotate = false,
  interactive = true,
  showRug = true,
  onPetTouch,
  onAnimationEnd,
  style,
}: Cat3DViewerProps) {
  const containerRef = useRef<View>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const effectiveHeight = height ?? (style ? "100%" : (size ?? 380));

  // Determine animation based on pet mood if not explicitly passed
  const activeAnimation: CatAnimationName =
    animation ??
    (pet
      ? pet.state.mood >= 70
        ? "Happy_Idle"
        : pet.state.mood < 40 || pet.state.satiety < 40
        ? "Sad_Idle"
        : "Idle_Default"
      : "Idle_Default");

  // Keep ref to current animation name to handle prop updates
  const animRef = useRef<CatAnimationName>(activeAnimation);
  const currentStateRef = useRef<CatAnimationName>(activeAnimation);
  const actionsMapRef = useRef<Record<string, any>>({});
  const mixerRef = useRef<any>(null);
  const playStateRef = useRef<(name: CatAnimationName) => void>(() => {});
  const onAnimationEndRef = useRef(onAnimationEnd);
  const onPetTouchRef = useRef(onPetTouch);

  useEffect(() => {
    animRef.current = activeAnimation;
  }, [activeAnimation]);

  useEffect(() => {
    onAnimationEndRef.current = onAnimationEnd;
  }, [onAnimationEnd]);

  useEffect(() => {
    onPetTouchRef.current = onPetTouch;
  }, [onPetTouch]);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    let isMounted = true;
    let renderer: any = null;
    let camera: any = null;
    let frameId: number = 0;
    let sceneObj: any = null;
    let handleResize: (() => void) | null = null;
    let resizeObserver: any = null;

    async function initThree() {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");

        const el = containerRef.current as unknown as HTMLElement;
        if (!el || !isMounted) return;

        // Clean container
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }

        const initialW = typeof width === "number" ? width : (el.clientWidth || 360);
        const initialH =
          typeof height === "number"
            ? height
            : el.clientHeight || el.parentElement?.clientHeight || (typeof effectiveHeight === "number" ? effectiveHeight : 600);

        const scene = new THREE.Scene();

        // Soft studio lighting
        const ambient = new THREE.AmbientLight(0xffffff, 1.8);
        scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
        keyLight.position.set(3, 5, 4);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xbad7ff, 1.0);
        fillLight.position.set(-3, 2, -2);
        scene.add(fillLight);

        const frontLight = new THREE.DirectionalLight(0xfff8ee, 1.4);
        frontLight.position.set(0, 1.5, 4);
        scene.add(frontLight);

        // Procedural Stylized Cozy Woven Rug & Shadow in Three.js
        if (showRug) {
          const rugGroup = new THREE.Group();
          rugGroup.position.set(0, modelY, 0);

          // Base circular rug
          const rugGeo = new THREE.CylinderGeometry(1.85, 1.85, 0.03, 64);
          const rugMat = new THREE.MeshStandardMaterial({
            color: 0xede6d8, // warm soft woven cream
            roughness: 0.95,
            metalness: 0.05,
          });
          const rugMesh = new THREE.Mesh(rugGeo, rugMat);
          rugMesh.position.y = -0.015;
          rugMesh.receiveShadow = true;
          rugGroup.add(rugMesh);

          // Concentric decorative braided rings
          const ring1Geo = new THREE.TorusGeometry(1.45, 0.022, 16, 64);
          ring1Geo.rotateX(Math.PI / 2);
          ring1Geo.translate(0, 0.005, 0);
          const ring1Mat = new THREE.MeshStandardMaterial({ color: 0x8ea891, roughness: 0.85 }); // sage green
          rugGroup.add(new THREE.Mesh(ring1Geo, ring1Mat));

          const ring2Geo = new THREE.TorusGeometry(0.95, 0.02, 16, 64);
          ring2Geo.rotateX(Math.PI / 2);
          ring2Geo.translate(0, 0.005, 0);
          const ring2Mat = new THREE.MeshStandardMaterial({ color: 0xc4b299, roughness: 0.85 }); // warm straw accent
          rugGroup.add(new THREE.Mesh(ring2Geo, ring2Mat));

          // Outer braided border
          const borderGeo = new THREE.TorusGeometry(1.85, 0.03, 16, 64);
          borderGeo.rotateX(Math.PI / 2);
          borderGeo.translate(0, 0.005, 0);
          const borderMat = new THREE.MeshStandardMaterial({ color: 0x6e8e72, roughness: 0.85 });
          rugGroup.add(new THREE.Mesh(borderGeo, borderMat));

          // Smooth radial contact shadow right under the cat
          if (typeof document !== "undefined") {
            const shadowCanvas = document.createElement("canvas");
            shadowCanvas.width = 128;
            shadowCanvas.height = 128;
            const ctx = shadowCanvas.getContext("2d");
            if (ctx) {
              const grad = ctx.createRadialGradient(64, 64, 12, 64, 64, 64);
              grad.addColorStop(0, "rgba(35, 42, 35, 0.42)");
              grad.addColorStop(0.5, "rgba(35, 42, 35, 0.18)");
              grad.addColorStop(1, "rgba(35, 42, 35, 0)");
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, 128, 128);
            }
            const shadowTex = new THREE.CanvasTexture(shadowCanvas);
            const shadowGeo = new THREE.PlaneGeometry(1.7, 1.7);
            shadowGeo.rotateX(-Math.PI / 2);
            const shadowMat = new THREE.MeshBasicMaterial({
              map: shadowTex,
              transparent: true,
              depthWrite: false,
            });
            const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
            shadowMesh.position.y = 0.008;
            rugGroup.add(shadowMesh);
          }

          scene.add(rugGroup);
        }

        camera = new THREE.PerspectiveCamera(40, initialW / initialH, 0.1, 50);
        camera.position.set(0, cameraY, cameraDistance);
        camera.lookAt(0, cameraLookAtY, 0);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(initialW, initialH);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = true;

        const dom = renderer.domElement;
        dom.style.display = "block";
        dom.style.width = "100%";
        dom.style.height = "100%";
        dom.style.outline = "none";
        el.appendChild(dom);

        handleResize = () => {
          if (!el || !renderer || !camera) return;
          const newW = typeof width === "number" ? width : (el.clientWidth || 360);
          const newH =
            typeof effectiveHeight === "number"
              ? effectiveHeight
              : el.clientHeight || el.parentElement?.clientHeight || 600;
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          camera.lookAt(0, cameraLookAtY, 0);
          renderer.setSize(newW, newH);
        };
        window.addEventListener("resize", handleResize);

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            handleResize?.();
          });
          resizeObserver.observe(el);
          if (el.parentElement) {
            resizeObserver.observe(el.parentElement);
          }
        }

        // Interactive mouse / touch rotation
        let isDragging = false;
        let prevX = 0;
        let dragDistance = 0;

        const onPointerDown = (e: MouseEvent | TouchEvent) => {
          isDragging = true;
          dragDistance = 0;
          prevX = "touches" in e ? e.touches[0].clientX : e.clientX;
        };

        const onPointerMove = (e: MouseEvent | TouchEvent) => {
          if (!isDragging || !sceneObj) return;
          const currentX = "touches" in e ? e.touches[0].clientX : e.clientX;
          const deltaX = currentX - prevX;
          dragDistance += Math.abs(deltaX);
          prevX = currentX;
          sceneObj.rotation.y += deltaX * 0.015;
        };

        const onPointerUp = () => {
          if (isDragging && dragDistance < 8) {
            if (onPetTouchRef.current) onPetTouchRef.current();
          }
          isDragging = false;
        };

        if (interactive) {
          dom.style.cursor = "grab";
          dom.addEventListener("mousedown", onPointerDown);
          window.addEventListener("mousemove", onPointerMove);
          window.addEventListener("mouseup", onPointerUp);

          dom.addEventListener("touchstart", onPointerDown, { passive: true });
          window.addEventListener("touchmove", onPointerMove, { passive: true });
          window.addEventListener("touchend", onPointerUp);
        }

        // Load the 3D model
        const loader = new GLTFLoader();
        loader.load(
          "/models/cat.glb",
          (gltf: any) => {
            if (!isMounted) return;

            sceneObj = gltf.scene;

            // Center model horizontally so rotation is around center
            const box = new THREE.Box3().setFromObject(sceneObj);
            const center = new THREE.Vector3();
            box.getCenter(center);
            sceneObj.position.x = -center.x;
            sceneObj.position.y = modelY;
            sceneObj.position.z = -center.z;

            scene.add(sceneObj);

            // Setup animations with instant switching (zero crossfade, pure crisp cut)
            if (gltf.animations && gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(sceneObj);
              mixerRef.current = mixer;

              const actions: Record<string, any> = {};
              gltf.animations.forEach((clip: any) => {
                const action = mixer.clipAction(clip);
                action.setLoop(THREE.LoopRepeat, Infinity);
                actions[clip.name] = action;
              });
              actionsMapRef.current = actions;

              const transitionTo = (target: CatAnimationName) => {
                const currentActions = actionsMapRef.current;
                if (!currentActions || !currentActions[target]) return;

                const prevName = currentStateRef.current;
                if (prevName === target) return;

                const prevAction = currentActions[prevName];
                const nextAction = currentActions[target];

                // Stop previous animation immediately (NO crossfade / zero blending)
                if (prevAction) {
                  prevAction.stop();
                  prevAction.setEffectiveWeight(0);
                }

                // Reset and play next animation continuously (animation remains playing)
                nextAction.reset();
                nextAction.setLoop(THREE.LoopRepeat, Infinity);
                nextAction.enabled = true;
                nextAction.setEffectiveTimeScale(1);
                nextAction.setEffectiveWeight(1);
                nextAction.play();

                currentStateRef.current = target;
              };

              playStateRef.current = transitionTo;

              // Initial animation playback
              const initialName = animRef.current || "Idle_Default";
              currentStateRef.current = initialName;
              const initAction = actions[initialName] || actions["Idle_Default"];
              if (initAction) {
                initAction.play();
              }
            }

            setLoaded(true);
          },
          undefined,
          () => {
            if (isMounted) setLoadError(true);
          }
        );

        const clock = new THREE.Clock();
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          const delta = clock.getDelta();

          if (mixerRef.current) {
            mixerRef.current.update(delta);
          }

          if (autoRotate && sceneObj && !isDragging) {
            sceneObj.rotation.y += 0.008;
          }

          renderer.render(scene, camera);
        };

        animate();
      } catch {
        if (isMounted) setLoadError(true);
      }
    }

    initThree();

    return () => {
      isMounted = false;
      if (frameId) cancelAnimationFrame(frameId);
      if (handleResize) {
        window.removeEventListener("resize", handleResize);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [width, height, effectiveHeight, cameraDistance, cameraY, cameraLookAtY, modelY, autoRotate, interactive, showRug]);

  // Handle animation prop updates with state machine
  useEffect(() => {
    if (!loaded) return;
    playStateRef.current(activeAnimation);
  }, [activeAnimation, loaded]);

  // Fallback for native mobile or if loading failed
  if (Platform.OS !== "web" || loadError) {
    const fallbackSize = typeof effectiveHeight === "number" ? Math.min(effectiveHeight * 0.7, 220) : 220;
    return (
      <View style={[styles.container, { width: (width as any) || "100%", height: effectiveHeight as any }, style]}>
        {pet ? <PetAvatar pet={pet} size={fallbackSize} /> : <Text style={{ fontSize: 48 }}>🐱</Text>}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: (width as any) || "100%", height: effectiveHeight as any },
        style,
      ]}
    >
      <View
        ref={containerRef}
        style={styles.webglCanvasWrapper}
      />
      {!loaded && !loadError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Загрузка 3D...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },
  webglCanvasWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  loadingOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: radius.md,
    padding: 8,
  },
  loadingText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "700",
    marginTop: 4,
  },
});
