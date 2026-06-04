'use client';

import { LmxP9View } from '@cco/components/lmx/lmx-p9-view';
import { LmxP7View } from '@cco/components/lmx/lmx-p7-view';
import { LmxP2View } from '@cco/components/lmx/lmx-p2-view';
import { LmxP3View } from '@cco/components/lmx/lmx-p3-view';
import { LmxP8View } from '@cco/components/lmx/lmx-p8-view';
import { LmxP0View } from '@cco/components/lmx/lmx-p0-view';
import { LmxPanePolicy } from '@cco/components/lmx/lmx-p4-view';
import { LmxP6View } from '@cco/components/lmx/lmx-p6-view';
import { LmxP1View } from '@cco/components/lmx/lmx-p1-view';
import { LmxP5View } from '@cco/components/lmx/lmx-p5-view';
import { useLmxStore, type LmxPaneId } from '@cco/stores/lmx-store';

const PANEL_BY_FEATURE: Record<LmxPaneId, React.ComponentType> = {
  p0: LmxP0View,
  p1: LmxP1View,
  p2: LmxP2View,
  p3: LmxP3View,
  p4: () => <LmxPanePolicy embedded />,
  p5: LmxP5View,
  p6: LmxP6View,
  p7: LmxP7View,
  p8: LmxP8View,
  p9: LmxP9View,
};

export function LmxBody() {
  const activeFeature = useLmxStore((s) => s.activeFeature);
  const Panel = PANEL_BY_FEATURE[activeFeature] ?? LmxP0View;
  return <Panel />;
}
