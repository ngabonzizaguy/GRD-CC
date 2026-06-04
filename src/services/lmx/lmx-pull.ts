import { pullLmxPrefs } from '@cco/services/lmx/lmx-s2';
import { pullLmxNav } from '@cco/services/lmx/lmx-nav-pull';
import { pullLmxChord } from '@cco/services/lmx/lmx-s1';


export async function pullLmxRemote(): Promise<boolean> {
  const [nav, dashboard, shortcut] = await Promise.all([
    pullLmxNav(),
    pullLmxPrefs(),
    pullLmxChord(),
  ]);
  return nav || dashboard || shortcut;
}
