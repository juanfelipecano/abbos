import { Component, input } from '@angular/core';

/**
 * How a column's cells render: `name` bold mono, `code` chip, `mono` plain mono, `text` prose,
 * `keys` a row of <kbd> (cell value is a string array).
 */
export type CellKind = 'name' | 'code' | 'mono' | 'text' | 'keys';

export interface TableColumn {
    readonly header: string;
    readonly kind: CellKind;
    /** CSS width, e.g. '140px' or '30%'. */
    readonly width?: string;
}

export type TableCell = string | readonly string[];

/** Reference table used for API, parameters and keyboard sections. Scrolls sideways when narrow. */
@Component({
    selector: 'app-data-table',
    templateUrl: './data-table.html',
    styleUrl: './data-table.scss',
})
export class DataTable {
    public readonly columns = input.required<readonly TableColumn[]>();
    public readonly rows = input.required<readonly (readonly TableCell[])[]>();
    public readonly caption = input.required<string>();
    public readonly minWidth = input('560px');

    protected asList(cell: TableCell): readonly string[] {
        return typeof cell === 'string' ? [cell] : cell;
    }

    protected asText(cell: TableCell): string {
        return typeof cell === 'string' ? cell : cell.join(' ');
    }
}
