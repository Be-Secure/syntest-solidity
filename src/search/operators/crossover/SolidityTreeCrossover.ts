import { prng, Statement, Crossover, Properties } from "syntest-framework";
import { SolidityTestCase } from "../../../testcase/SolidityTestCase";
import { ConstructorCall } from "../../../testcase/statements/action/ConstructorCall";
import { NumericStatement } from "../../../testcase/statements/primitive/NumericStatement";

/**
 * Creates 2 children which are each other's complement with respect to their parents.
 * i.e. given parents 000000 and 111111 a possible pair of children would be 001111 and 110000.
 * However, it is not as simple because the actual mutation works with trees.
 *
 * @param parentA the first parent individual
 * @param parentB the second parent individual
 *
 * @return a tuple of 2 children
 *
 * @author Annibale Panichella
 * @author Dimitri Stallenberg
 */
export class SolidityTreeCrossover implements Crossover {
  public crossOver(
    parentA: SolidityTestCase,
    parentB: SolidityTestCase
  ): SolidityTestCase[] {
    const rootA = parentA.copy().root;
    const rootB = parentB.copy().root;

    const queueA: any = [];

    for (
      let i = 0;
      i < (rootA as ConstructorCall).getMethodCalls().length;
      i++
    ) {
      queueA.push({
        parent: rootA,
        childIndex: i,
        child: (rootA as ConstructorCall).getMethodCalls()[i],
      });
    }

    const crossoverOptions = [];

    while (queueA.length) {
      const pair = queueA.shift();

      if (pair.child.hasChildren()) {
        pair.child.getChildren().forEach((child: Statement, index: number) => {
          queueA.push({
            parent: pair.child,
            childIndex: index,
            child: child,
          });
        });
      }

      if (prng.nextBoolean(Properties.crossover_probability)) {
        // crossover
        const donorSubtrees = this.findSimilarSubtree(pair.child, rootB);

        for (const donorTree of donorSubtrees) {
          crossoverOptions.push({
            p1: pair,
            p2: donorTree,
          });
        }
      }
    }

    if (crossoverOptions.length) {
      const crossoverChoice = prng.pickOne(crossoverOptions);
      const pair = crossoverChoice.p1;
      const donorTree = crossoverChoice.p2;

      pair.parent.setChild(pair.childIndex, donorTree.child.copy());
      donorTree.parent.setChild(donorTree.childIndex, pair.child.copy());
    }

    rootA.args = [...parentA.root.args];
    rootB.args = [...parentB.root.args];
    return [
      new SolidityTestCase(rootA as ConstructorCall),
      new SolidityTestCase(rootB as ConstructorCall),
    ];
  }

  /**
   * Finds a subtree in the given tree which matches the wanted gene.
   *
   * @param wanted the gene to match the subtree with
   * @param tree the tree to search in
   *
   * @author Dimitri Stallenberg
   */
  protected findSimilarSubtree(wanted: Statement, tree: Statement) {
    const queue: any = [];
    const similar = [];

    for (let i = 0; i < tree.getChildren().length; i++) {
      queue.push({
        parent: tree,
        childIndex: i,
        child: tree.getChildren()[i],
      });
    }

    while (queue.length) {
      const pair = queue.shift();

      if (pair.child.hasChildren()) {
        pair.child.getChildren().forEach((child: Statement, index: number) => {
          queue.push({
            parent: pair.child,
            childIndex: index,
            child: child,
          });
        });
      }

      if (wanted.types === pair.child.type) {
        if (wanted instanceof NumericStatement) {
          if (
            wanted.upper_bound ==
              (pair.child as NumericStatement).upper_bound &&
            wanted.lower_bound == (pair.child as NumericStatement).lower_bound
          ) {
            similar.push(pair);
          }
        } else {
          similar.push(pair);
        }
      }
    }

    return similar;
  }
}
