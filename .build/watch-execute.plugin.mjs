import { globSync } from "glob";
import { resolve } from "path";

/** @implements {import('webpack').WebpackPluginInstance} */
export default class WatchExecutePlugin {
  /**
   *
   * @param {string} watchPattern
   * @param {(changed: ReadonlySet<string>) => void} toExecuteForAny
   * @param {(changed: string) => void} toExecuteForEach
   */
  constructor(watchPattern, toExecuteForAny, toExecuteForEach) {
    this.watchPattern = watchPattern;
    this.toExecuteForAny = toExecuteForAny;
    this.toExecuteForEach = toExecuteForEach;
  }

  getWatchedFiles() {
    const watched = globSync(this.watchPattern).map((x) => resolve(x));
    return watched;
  }

  /** @param {import('webpack').Compiler} compiler */
  apply(compiler) {
    compiler.hooks.afterCompile.tap(this.constructor.name, (compilation) => {
      const toWatch = this.getWatchedFiles();
      compilation.fileDependencies.addAll(toWatch);
    });

    compiler.hooks.watchRun.tap(this.constructor.name, (compiler) => {
      if (compiler.modifiedFiles) {
        const watched = this.getWatchedFiles();
        if (
          Array.from(compiler.modifiedFiles).some((x) => watched.includes(x))
        ) {
          if (this.toExecuteForAny) {
            this.toExecuteForAny(compiler.modifiedFiles);
          }
          if (this.toExecuteForEach) {
            for (const file of compiler.modifiedFiles) {
              this.toExecuteForEach(file);
            }
          }
        }
      }
    });
  }
}
