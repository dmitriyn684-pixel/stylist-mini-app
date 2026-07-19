import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, BufferGeometry, Group, Mesh, MeshPhysicalMaterial, Vector3 } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { BodyMeasurements } from '../../types/avatar';
import type { MannequinHighlight } from './ParametricMannequin';

const IVORY_TEXTILE = '#F1E6DA';
const DARK_WOOD = '#4A3728';
const NORMALIZED_HEIGHT = 1.78;
const GROUND_Y = -0.36;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface MannequinModelProps {
  measurements: BodyMeasurements;
  highlights?: MannequinHighlight[];
  url?: string;
}

function separateStandMaterial(geometry: BufferGeometry) {
  const prepared = geometry.clone();
  const positions = prepared.getAttribute('position');
  const sourceIndex = prepared.getIndex();

  prepared.computeBoundingBox();
  const bounds = prepared.boundingBox;

  if (!positions || !sourceIndex || !bounds) {
    return prepared;
  }

  const standLimit = bounds.min.y + (bounds.max.y - bounds.min.y) * 0.34;
  const textileTriangles: number[] = [];
  const woodTriangles: number[] = [];

  for (let offset = 0; offset < sourceIndex.count; offset += 3) {
    const a = sourceIndex.getX(offset);
    const b = sourceIndex.getX(offset + 1);
    const c = sourceIndex.getX(offset + 2);
    const centerY = (positions.getY(a) + positions.getY(b) + positions.getY(c)) / 3;
    const target = centerY <= standLimit ? woodTriangles : textileTriangles;
    target.push(a, b, c);
  }

  if (!woodTriangles.length || !textileTriangles.length) {
    return prepared;
  }

  prepared.setIndex([...woodTriangles, ...textileTriangles]);
  prepared.clearGroups();
  prepared.addGroup(0, woodTriangles.length, 1);
  prepared.addGroup(woodTriangles.length, textileTriangles.length, 0);
  prepared.computeVertexNormals();

  return prepared;
}

export function MannequinModel({
  measurements,
  highlights = [],
  url = '/models/mannequin.glb',
}: MannequinModelProps) {
  const measurementGroup = useRef<Group>(null);
  const { scene } = useGLTF(url);

  const fullHighlight = highlights.find((highlight) => highlight.zone === 'full');
  const torsoHighlight = highlights.find((highlight) => highlight.zone === 'torso');
  const textileColor = fullHighlight?.color ?? torsoHighlight?.color ?? IVORY_TEXTILE;

  const textileMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: textileColor,
        roughness: 0.72,
        metalness: 0.02,
        clearcoat: 0.08,
        clearcoatRoughness: 0.45,
      }),
    [textileColor],
  );

  const woodMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: DARK_WOOD,
        roughness: 0.35,
        metalness: 0.1,
      }),
    [],
  );

  const preparedScene = useMemo(() => {
    const model = clone(scene) as Group;

    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;

      const objectName = object.name.toLowerCase();

      if (/stand|wood|base|pole/.test(objectName)) {
        object.geometry = object.geometry.clone();
        object.material = woodMaterial;
      } else if (/textile|dressform|torso|body/.test(objectName)) {
        object.geometry = object.geometry.clone();
        object.material = textileMaterial;
      } else {
        object.geometry = separateStandMaterial(object.geometry);
        object.material = [textileMaterial, woodMaterial];
      }
      object.castShadow = false;
      object.receiveShadow = false;
    });

    model.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(model);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const normalizationScale = size.y > 0 ? NORMALIZED_HEIGHT / size.y : 1;

    model.scale.setScalar(normalizationScale);
    model.position.set(
      -center.x * normalizationScale,
      GROUND_Y - bounds.min.y * normalizationScale,
      -center.z * normalizationScale,
    );

    return model;
  }, [scene, textileMaterial, woodMaterial]);

  const heightScale = clamp(measurements.height / 165, 0.92, 1.1);
  const shoulderWidth = measurements.shoulderWidth;
  const hipWidth = measurements.hipCircumference / Math.PI;
  const waistWidth = measurements.waistCircumference / Math.PI;
  const silhouetteScale = clamp(
    (shoulderWidth / 38 + hipWidth / 34 + waistWidth / 28) / 3,
    0.94,
    1.08,
  );

  useEffect(() => {
    measurementGroup.current?.scale.set(silhouetteScale, heightScale, silhouetteScale);
  }, [heightScale, silhouetteScale]);

  useEffect(
    () => () => {
      textileMaterial.dispose();
      woodMaterial.dispose();
      preparedScene.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
    },
    [preparedScene, textileMaterial, woodMaterial],
  );

  return (
    <group ref={measurementGroup}>
      <primitive object={preparedScene} />
    </group>
  );
}

useGLTF.preload('/models/mannequin.glb');
