import * as React from 'react';
import $ from 'jquery';
import { observer } from 'mobx-react';
import { Title, IconObject, ObjectName, Icon } from 'Component';
import { I, C, UtilObject, UtilRouter, translate, Action } from 'Lib';
import { popupStore, dbStore, detailStore, menuStore, authStore } from 'Store';
import Constant from 'json/constant.json';

const PopupSettingsPageSpacesList = observer(class PopupSettingsPageSpacesList extends React.Component<{}, {}> {

	constructor (props) {
		super(props);
	};

	render () {
		const { accountSpaceId } = authStore;
		const spaces = this.getItems();

		const Row = (space: any) => {
			const creator = detailStore.get(Constant.subId.space, space.creator);
			const participant = UtilObject.getMyParticipant(space.targetSpaceId);
			const isOwner = participant && (participant.permissions == I.ParticipantPermissions.Owner);
			const permissions = participant ? translate(`participantPermissions${participant.permissions}`) : '';
			const hasMenu = space.targetSpaceId != accountSpaceId;

			return (
				<tr>
					<td className="columnSpace">
						<div className="spaceNameWrapper" onClick={() => this.onClick(space)}>
							<IconObject object={space} size={40} />
							<div className="info">
								<ObjectName object={space} />

								{!isOwner && !creator._empty_ ? (
									<div className="creatorNameWrapper">
										<IconObject object={creator} size={16} />
										<ObjectName object={creator} />
									</div>
								) : ''}
							</div>
						</div>
					</td>
					<td>{permissions}</td>
					<td>{translate(`spaceStatus${space.spaceAccountStatus}`)}</td>

					<td className="columnMore">
						{hasMenu ? (
							<div id={`icon-more-${space.id}`} onClick={() => this.onMore(space)} className="iconWrap">
								<Icon className="more" />
							</div>
						) : ''}
					</td>
				</tr>
			);
		};

		return (
			<React.Fragment>
				<Title text={translate('popupSettingsSpacesListTitle')} />

				<div className="items">
					<table>
						<thead>
							<tr>
								<th className="columnSpace">{translate('popupSettingsSpacesListSpace')}</th>
								<th>{translate('popupSettingsSpacesListAccess')}</th>
								<th>{translate('popupSettingsSpacesListNetwork')}</th>
								<th className="columnMore"> </th>
							</tr>
						</thead>
						<tbody>
							{spaces.map((item: any, i: number) => <Row key={i} {...item} />)}
						</tbody>
					</table>
				</div>
			</React.Fragment>
		);
	};

	getItems () {
		const subId = Constant.subId.space;
		const items = dbStore.getRecords(subId, '').map(id => detailStore.get(subId, id));

		return items.filter(it => ![ I.SpaceStatus.Deleted, I.SpaceStatus.Removing ].includes(it.spaceAccountStatus));
	};

	onClick (space: any) {
		if (space.spaceAccountStatus != I.SpaceStatus.Joining) {
			UtilRouter.switchSpace(space.targetSpaceId, 'ScreenSettings');
		};
	};

	onMore (space: any) {
		const element = $(`#icon-more-${space.id}`);
		const options: any[] = [];

		if (space.spaceAccountStatus == I.SpaceStatus.Joining) {
			options.push({ id: 'cancel', color: 'red', name: translate('popupSettingsSpacesCancelRequest') });
		} else {
			options.push({ id: 'remove', color: 'red', name: translate('commonDelete') });
		};

		menuStore.open('select', {
			element,
			vertical: I.MenuDirection.Bottom,
			horizontal: I.MenuDirection.Right,
			offsetY: 4,
			onOpen: () => element.addClass('active'),
			onClose: () => element.removeClass('active'),
			data: {
				options,
				onSelect: (e: any, item: any) => {
					switch (item.id) {
						case 'remove':
							Action.removeSpace(space.targetSpaceId, 'ScreenSettings');
							break;

						case 'cancel':
							C.SpaceJoinCancel(space.targetSpaceId, (message: any) => {
								if (message.error.code) {
									popupStore.open('confirm', {
										data: {
											title: translate('commonError'),
											text: message.error.description,
										}
									});
								};
							});
							break;
					};
				}
			}
		});
	};

});

export default PopupSettingsPageSpacesList;
