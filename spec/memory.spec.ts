import {type anyLocator, createLocator, type Locator} from 'create-locator';

import {createRandomTree, ok} from './utils';

const baselineTicks = 300_000;
const bytesPerTickLimit = 10;
const Kb = 1024;
const startTime = Date.now();
const ticksPerMessage = 50_000;
const totalTicks = 1_000_000;

const createLocatorByTree = (locator: typeof anyLocator, tree: Tree): void => {
  for (const key of Object.keys(tree)) {
    //@ts-expect-error
    const childLocator: typeof anyLocator = locator[key];
    const value = tree[key];

    childLocator({foo: typeof value === 'string' ? value : 'bar'});

    if (typeof value === 'object') {
      createLocatorByTree(childLocator, value);
    }
  }
};

let baselineUsage: Record<string, number>;

let previousUsage = process.memoryUsage();
let tickCount = 0;

const getTickCountString = (ticks: number) => `${Math.round(ticks / 1000)}K ticks`;

const processDiff = (
  assertLimits: boolean,
  header: string,
  aUsage: Record<string, number>,
  bUsage: Record<string, number>,
  ticksPerDiff: number,
): void => {
  console.log(
    assertLimits ? header : `${header} (${((Date.now() - startTime) / 1000).toFixed(2)} sec)`,
  );

  let isLimitExceeded = false;

  for (const key of Object.keys(bUsage)) {
    const diff = bUsage[key]! - aUsage[key]!;

    if (Math.abs(diff) > 10 * Kb) {
      const kb = (diff / Kb).toFixed(2);
      const perTickNumber = diff / ticksPerDiff;
      const perTick = perTickNumber.toFixed(2);
      const sign = diff > 0 ? '+' : '';

      if (perTickNumber > bytesPerTickLimit) {
        isLimitExceeded = true;
      }

      console.log(`${key}: ${sign}${kb} Kb (${sign}${perTick} bytes/tick)`);
    }
  }

  console.log('');

  if (assertLimits) {
    if (isLimitExceeded) {
      throw new Error(`Limit of +${bytesPerTickLimit} bytes per tick exceeded`);
    } else {
      ok(`Limit of +${bytesPerTickLimit} bytes per tick not exceeded`);
    }
  }
};

const tick = (): void => {
  tickCount += 1;

  if (tickCount > totalTicks) {
    setTimeout(() => {
      const ticksPerDiff = totalTicks - baselineTicks;
      const ticksPerDiffString = `Total (${getTickCountString(ticksPerDiff)})`;

      processDiff(true, ticksPerDiffString, baselineUsage, process.memoryUsage(), ticksPerDiff);
    }, 500);

    return;
  }

  const memoryUsage = process.memoryUsage();

  if (!baselineUsage && tickCount >= baselineTicks) {
    console.log('Save baseline memory usage');

    baselineUsage = memoryUsage;
  }

  if (tickCount % ticksPerMessage === 0) {
    processDiff(false, getTickCountString(tickCount), previousUsage, memoryUsage, ticksPerMessage);

    previousUsage = memoryUsage;

    setTimeout(tick, 0);

    return;
  }

  const rootLocator = createLocator<Locator<void>>('app');

  createLocatorByTree(rootLocator, createRandomTree());

  const mappedLocator = createLocator<Locator<void>, object>('app', {
    mapAttributesChain: (attributesChain) => attributesChain,
  });

  createLocatorByTree(mappedLocator as typeof anyLocator, createRandomTree());

  process.nextTick(tick);
};

tick();

export type Tree = {[key: string]: string | Tree};
