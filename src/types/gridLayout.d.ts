export enum Thresholds {
	xs = 0,
	sm = 600,
	md = 960,
	lg = 1264,
	xl = 1904
}

type ScreenThresholds = {
	[key in keyof typeof Thresholds]?: Partial<CSSStyleDeclaration>;
};

interface IGridItemStyles extends ScreenThresholds {
	style?: Partial<CSSStyleDeclaration>;
}

interface GridItemStyles extends ScreenThresholds {
	style: Partial<CSSStyleDeclaration>;
}

interface IMap<T> {
	[key: string]: T;
}

export interface IGrid {
	styles?: IGridItemStyles;
	listeners?: IMap<EventListener>;
}

export interface IGridItem extends IGrid {
	name: string;
	component?: string | any;
}

export type ILayoutTemplate = {
	grid: IGrid;
	items: Array<IGridItem>;
	customLayouts: ILayoutMap;
};

export type LayoutTemplate = {
	grid: Grid;
	items: Array<GridItem>;
	customLayouts: LayoutMap;
};

export type LayoutMap = IMap<LayoutTemplate>;

export type ILayoutMap = IMap<ILayoutTemplate>;

export interface Grid {
	listeners: IMap<EventListener>;
	styles: GridItemStyles;
	computedStyle: Partial<CSSStyleDeclaration>;
}

export interface GridItem extends Grid {
	name: string;
	component: string | any;
}

export as namespace LAYOUT;
