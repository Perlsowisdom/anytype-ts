import * as React from 'react';
import { observer } from 'mobx-react';
import { Editable } from 'Component';
import { I, C, keyboard, UtilDate, Mark } from 'Lib';
import { authStore, blockStore } from 'Store';

import ChatMessage from './chat/message';

const LIMIT = 50;

const BlockChat = observer(class BlockChat extends React.Component<I.BlockComponent> {

	_isMounted = false;
	refList = null;
	refEditable = null;
	marks: I.Mark[] = [];
	range: I.TextRange = null;

	constructor (props: I.BlockComponent) {
		super(props);

		this.onSelect = this.onSelect.bind(this);
		this.onFocusInput = this.onFocusInput.bind(this);
		this.onBlurInput = this.onBlurInput.bind(this);
		this.onKeyUpInput = this.onKeyUpInput.bind(this);
		this.onKeyDownInput = this.onKeyDownInput.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onPaste = this.onPaste.bind(this);
	};

	render () {
		const { rootId, block, readonly } = this.props;
		const messages = this.getMessages();

		return (
			<div>
				<div ref={ref => this.refList = ref} className="list">
					{messages.map((item: any, index: number) => (
						<ChatMessage key={item.id} {...item} />
					))}
				</div>

				<div className="bottom">
					<Editable 
						ref={ref => this.refEditable = ref}
						id="input"
						readonly={readonly}
						placeholder={'Enter your message'}
						onSelect={this.onSelect}
						onFocus={this.onFocusInput}
						onBlur={this.onBlurInput}
						onKeyUp={this.onKeyUpInput} 
						onKeyDown={this.onKeyDownInput}
						onInput={this.onChange}
						onPaste={this.onPaste}
						onMouseDown={this.onSelect}
					/>
				</div>
			</div>
		);
	};
	
	componentDidMount () {
		this._isMounted = true;
		this.scrollToBottom();
	};
	
	componentWillUnmount () {
		this._isMounted = false;
	};

	onSelect = (e: any) => {
	};

	onFocusInput = (e: any) => {
		this.refEditable?.placeholderCheck();
	};

	onBlurInput = (e: any) => {
		this.refEditable?.placeholderCheck();
	};

	onKeyUpInput = (e: any) => {
		this.range = this.refEditable.getRange();

		const value = this.getTextValue();
		const parsed = this.getMarksFromHtml();

		if (value !== parsed.text) {
			this.marks = parsed.marks;
			this.refEditable.setValue(Mark.toHtml(parsed.text, this.marks));
			this.refEditable.setRange(this.range);
		};
	};

	onKeyDownInput = (e: any) => {
		keyboard.shortcut('enter', e, () => {
			e.preventDefault();

			this.onAddMessage();
		});
	};

	onChange = (e: any) => {
	};

	onPaste = (e: any) => {
	};

	getMessages () {
		const { rootId, block } = this.props;
		const childrenIds = blockStore.getChildrenIds(rootId, block.id);
		const children = blockStore.unwrapTree([ blockStore.wrapTree(rootId, block.id) ]).filter(it => it.isText());
		const length = children.length;
		const slice = length > LIMIT ? children.slice(length - LIMIT, length) : children;

		return slice.map(it => {
			it.data = JSON.parse(it.content.text);
			return it;
		});
	};

	onAddMessage = () => {
		const value = this.getTextValue().trim();

		if (!value) {
			return;
		};

		const { rootId, block } = this.props;
		const { account } = authStore;
		const childrenIds = blockStore.getChildrenIds(rootId, block.id);
		const length = childrenIds.length;
		const target = length ? childrenIds[length - 1] : block.id;
		const position = length ? I.BlockPosition.Bottom : I.BlockPosition.InnerFirst;

		const data = {
			...this.getMarksFromHtml(),
			identity: account.id,
			time: UtilDate.now(),
		};
		
		const param = {
			type: I.BlockType.Text,
			style: I.TextStyle.Paragraph,
			content: {
				text: JSON.stringify(data),
			}
		};
		
		C.BlockCreate(rootId, target, position, param, (message: any) => {
			this.scrollToBottom();
		});

		this.marks = [];
		this.range = null;

		this.refEditable.setValue('');
		this.refEditable.placeholderCheck();
	};

	scrollToBottom () {
		$(this.refList).scrollTop(this.refList.scrollHeight);
	};

	getTextValue (): string {
		return String(this.refEditable?.getTextValue() || '');
	};

	getHtmlValue (): string {
		return String(this.refEditable?.getHtmlValue() || '');
	};
	
	getMarksFromHtml (): { marks: I.Mark[], text: string } {
		const { block } = this.props;
		const value = this.getHtmlValue();
		const restricted: I.MarkType[] = [];

		if (block.isTextHeader()) {
			restricted.push(I.MarkType.Bold);
		};
		
		return Mark.fromHtml(value, restricted);
	};

});

export default BlockChat;