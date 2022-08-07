import * as React from 'react';

let doc: Document;
let win: Window;

if (typeof document !== 'undefined') {
	doc = document;
}

if (typeof window !== 'undefined') {
	win = window;
}

export interface FrameEnvironment {
	document: Document;
	window: Window;
}

export const FrameContext = React.createContext<FrameEnvironment>({
	// @ts-expect-error
	document: doc,
	// @ts-expect-error
	window: win,
});

export const useFrame = () => React.useContext(FrameContext);

export const FrameContextConsumer = FrameContext.Consumer;
