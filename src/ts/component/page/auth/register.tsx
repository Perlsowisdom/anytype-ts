import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RouteComponentProps } from 'react-router';
import { Frame, Cover, Title, Label, Error, Input, Button, IconUser, HeaderAuth as Header, FooterAuth as Footer } from 'ts/component';
import { observer, inject } from 'mobx-react';
import { dispatcher, Util } from 'ts/lib';

const { dialog } = window.require('electron').remote;
const Err: any = {
	FAILED_TO_SET_AVATAR: 103
};

interface Props extends RouteComponentProps<any> {
	authStore?: any;
};
interface State {
	error: string;
	preview: string;
};

@inject('authStore')
@observer
class PageAuthRegister extends React.Component<Props, State> {

	nameRef: any;

	state = {
		error: '',
		preview: '',
	};
	
	constructor (props: any) {
		super(props);

		this.onFileClick = this.onFileClick.bind(this);
		this.onNameChange = this.onNameChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	};
	
	render () {
		const { error, preview } = this.state;
		const { authStore } = this.props;
		
		return (
			<div>
				<Cover num={3} />
				<Header />
				<Footer />
				
				<Frame>
					<Title text="Add name and profile picture" />
					<Error text={error} />
		
					<div className="fileWrap" onMouseDown={this.onFileClick}>
						<IconUser icon={preview} className={preview ? 'active' : ''} />
					</div>
						
					<Input ref={(ref: any) => this.nameRef = ref} placeHolder="Type your name" value={name} onKeyUp={this.onNameChange} />
					<Button text="Create profile" className="orange" onClick={this.onSubmit} />
				</Frame>
			</div>
		);
	};

	onFileClick (e: any) {
		const { authStore } = this.props;
		
		dialog.showOpenDialog({ properties: [ 'openFile' ] }, (files: any) => {
			if ((files == undefined) || !files.length) {
				return;
			};

			let path = files[0];
			
			authStore.iconSet(path);
			Util.loadPreviewBase64(Util.makeFileFromPath(path), {}, (image: string, param: any) => {
				this.setState({ preview: image });
			});
	    });
	};
	
	onNameChange (e: any) {
		const { authStore } = this.props;
		authStore.nameSet(this.nameRef.getValue());
	};

	onSubmit (e: any) {
		const { match, history } = this.props;
		
		e.preventDefault();
		history.push('/auth/setup/' + match.params.id);
	};
	
};

export default PageAuthRegister;