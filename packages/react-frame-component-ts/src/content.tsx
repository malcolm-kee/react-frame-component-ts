import * as React from 'react';

export interface ContentProps {
	children: React.ReactNode;
	contentDidMount: () => void;
	contentDidUpdate: () => void;
}

export class Content extends React.Component<ContentProps> {
	componentDidMount() {
		this.props.contentDidMount();
	}

	componentDidUpdate() {
		this.props.contentDidUpdate();
	}

	render() {
		return React.Children.only(this.props.children);
	}
}
