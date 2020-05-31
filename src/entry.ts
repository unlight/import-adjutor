/**
 * Class represents import item.
 */
export class Entry {
    /**
     * Export name.
     */
    name: string;
    /**
     * Canonicalized absolute pathname.
     */
    filepath?: string;
    /**
     * Node module name.
     */
    module?: string;
    /**
     * Flag indicates export default.
     */
    isDefault: boolean;

    constructor({
        name,
        filepath,
        module,
        isDefault,
    }: {
        name: string;
        module?: string;
        filepath?: string;
        isDefault?: boolean;
    }) {
        this.name = name;
        this.module = module;
        this.filepath = !module ? filepath : undefined;
        this.isDefault = Boolean(isDefault);
    }

    id() {
        return `${this.name}${this.isDefault ? '*' : ''}/${
            this.module ? this.module : this.filepath
        }`;
    }
}
