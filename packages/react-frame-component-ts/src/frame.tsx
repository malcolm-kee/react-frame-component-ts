import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Content } from './content';
import { FrameContext } from './context';

export interface FrameProps extends React.ComponentPropsWithoutRef<'iframe'> {
	style?: React.CSSProperties;
	head?: React.ReactNode;
	initialContent?: string;
	mountTarget?: string;
	contentDidMount?: () => void;
	contentDidUpdate?: () => void;
	children: React.ReactNode;
}

interface FrameState {
	iframeLoaded: boolean;
}

class FrameImpl extends React.Component<
	FrameProps & {
		forwardedRef: React.ForwardedRef<HTMLIFrameElement>;
	},
	FrameState
> {
	_isMounted = false;
	nodeRef =
		React.createRef<HTMLIFrameElement>() as React.MutableRefObject<HTMLIFrameElement | null>;
	state = {
		iframeLoaded: false,
	};

	componentDidMount() {
		this._isMounted = true;

		const doc = this.getDoc();

		if (doc && doc.readyState === 'complete') {
			this.forceUpdate();
		} else {
			this.nodeRef.current!.addEventListener('load', this.handleLoad);
		}
	}

	componentWillUnmount() {
		this._isMounted = false;

		this.nodeRef.current!.removeEventListener('load', this.handleLoad);
	}

	getMountTarget() {
		const doc = this.getDoc();
		if (this.props.mountTarget) {
			return doc!.querySelector(this.props.mountTarget);
		}
		return doc!.body.children[0];
	}

	setRef = (node: HTMLIFrameElement | null) => {
		this.nodeRef.current = node;

		const { forwardedRef } = this.props;

		if (typeof forwardedRef === 'function') {
			forwardedRef(node);
		} else if (forwardedRef) {
			forwardedRef.current = node;
		}
	};

	getDoc() {
		return this.nodeRef.current ? this.nodeRef.current.contentDocument : null;
	}

	handleLoad = () => {
		this.setState({ iframeLoaded: true });
	};

	renderFrameContents() {
		if (!this._isMounted) {
			return null;
		}

		const doc = this.getDoc();

		if (!doc) {
			return null;
		}

		const { contentDidMount = noop, contentDidUpdate = noop } = this.props;

		// @ts-expect-error
		const win = doc.defaultView || doc.parentView;
		const contents = (
			<Content
				contentDidMount={contentDidMount}
				contentDidUpdate={contentDidUpdate}
			>
				<FrameContext.Provider value={{ document: doc, window: win }}>
					<div className="frame-content">{this.props.children}</div>
				</FrameContext.Provider>
			</Content>
		);

		const mountTarget = this.getMountTarget();

		return [
			ReactDOM.createPortal(this.props.head, doc.head),
			ReactDOM.createPortal(contents, mountTarget as HTMLElement),
		];
	}

	render() {
		const {
			head,
			initialContent = defaultInitialContent,
			mountTarget,
			contentDidMount,
			contentDidUpdate,
			forwardedRef,
			children,
			...frameProps
		} = this.props;

		return (
			<iframe
				{...frameProps}
				srcDoc={initialContent}
				ref={this.setRef}
				onLoad={this.handleLoad}
			>
				{this.state.iframeLoaded && this.renderFrameContents()}
			</iframe>
		);
	}
}

export const Frame = React.forwardRef<HTMLIFrameElement, FrameProps>(
	(props, ref) => <FrameImpl {...props} forwardedRef={ref} />
);

const noop = () => {};
const defaultInitialContent =
	'<!DOCTYPE html><html><head></head><body><div class="frame-root"></div></body></html>';
