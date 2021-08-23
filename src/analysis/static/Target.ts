import { SearchSubject, AbstractTestCase, CFG } from "syntest-framework";
import { TargetPool } from "./TargetPool";
import * as path from "path";
import { DependencyAnalyzer } from "./dependency/DependencyAnalyzer";
import { TargetContext } from "./dependency/TargetContext";
import { ContractMetadata } from "./map/ContractMetadata";
import { Graph } from "./Graph";
import { ContractFunction } from "./map/ContractFunction";

/**
 * Target system under test.
 *
 * This class contains all data related to the target system.
 *
 * @author Mitchell Olsthoorn
 */
export class Target {
  protected readonly _path: string;
  protected readonly _name: string;

  private _source: string;
  private _abstractSyntaxTree: any;

  // Mapping: name -> Target
  private _dependencies: string[];

  private _context: TargetContext<ContractMetadata>;

  // Mapping: function name -> function
  private _functions: Map<string, ContractFunction>;

  private _controlFlowGraph: CFG;

  private _linkingGraph: Graph<string>;

  private _subject: SearchSubject<AbstractTestCase>;

  constructor(
    targetPath: string,
    targetName: string,
    source: string,
    ast: any,
    context: TargetContext<ContractMetadata>,
    functions: Map<string, any>,
    cfg: CFG,
    linkingGraph: Graph<string>,
    dependencies: string[]
  ) {
    this._path = path.resolve(targetPath);
    this._name = targetName;
    this._source = source;
    this._abstractSyntaxTree = ast;
    this._context = context;
    this._functions = functions;
    this._controlFlowGraph = cfg;
    this._linkingGraph = linkingGraph;
    this._dependencies = dependencies;
  }

  get path(): string {
    return this._path;
  }

  get name(): string {
    return this._name;
  }

  get source(): string {
    return this._source;
  }

  get abstractSyntaxTree(): any {
    return this._abstractSyntaxTree;
  }

  get dependencies(): string[] {
    return this._dependencies;
  }

  get context(): TargetContext<ContractMetadata> {
    return this._context;
  }

  get functions(): Map<string, any> {
    return this._functions;
  }

  get controlFlowGraph(): CFG {
    return this._controlFlowGraph;
  }

  get linkingGraph(): Graph<string> {
    return this._linkingGraph;
  }

  get subject(): SearchSubject<AbstractTestCase> {
    return this._subject;
  }
}
