/* eslint-disable react/jsx-equals-spacing */
import React, { useState } from "react";
import { connect } from "react-redux";

import { isMobileBrowser } from "../../base/environment/utils";
import { translate, translateToHTML } from "../../base/i18n/functions";
import Icon from "../../base/icons/components/Icon";
import { IconWarning } from "../../base/icons/svg";
import Watermarks from "../../base/react/components/web/Watermarks";
import getUnsafeRoomText from "../../base/util/getUnsafeRoomText.web";
import CalendarList from "../../calendar-sync/components/CalendarList.web";
import RecentList from "../../recent-list/components/RecentList.web";

import MenuPopupState from "./menu-popup-state/MenuPopupState";

import { AbstractWelcomePage, IProps, _mapStateToProps } from "./AbstractWelcomePage";
import Tabs from "./Tabs";
import baseApi from "../../../api/axios";

import InviteButton from "./invite-button/InviteButton";

/**
 * The pattern used to validate room name.
 *
 * @type {string}
 */
export const ROOM_NAME_VALIDATE_PATTERN_STR = "^[^?&:\u0022\u0027%#]+$";

/**
 * The Web container rendering the welcome page.
 *
 * @augments AbstractWelcomePage
 */
class WelcomePage extends AbstractWelcomePage<IProps> {
    _additionalContentRef: HTMLDivElement | null;
    _additionalToolbarContentRef: HTMLDivElement | null;
    _additionalCardRef: HTMLDivElement | null;
    _roomInputRef: HTMLInputElement | null;
    _additionalCardTemplate: HTMLTemplateElement | null;
    _additionalContentTemplate: HTMLTemplateElement | null;
    _additionalToolbarContentTemplate: HTMLTemplateElement | null;
    _titleHasNotAllowCharacter: boolean;
    jwtParam: any;

    /**
     * Default values for {@code WelcomePage} component's properties.
     *
     * @static
     */
    static defaultProps = {
        _room: "",
    };

    /**
     * Initializes a new WelcomePage instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this.state = {
            ...this.state,

            generateRoomNames: String(new Date()),
        };

        /**
         * Used To display a warning massage if the title input has no allow character.
         *
         * @private
         * @type {boolean}
         */
        this._titleHasNotAllowCharacter = false;

        /**
         * The HTML Element used as the container for additional content. Used
         * for directly appending the additional content template to the dom.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentRef = null;

        this.jwtParam = null;

        this._roomInputRef = null;

        /**
         * The HTML Element used as the container for additional toolbar content. Used
         * for directly appending the additional content template to the dom.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalToolbarContentRef = null;

        this._additionalCardRef = null;

        /**
         * The template to use as the additional card displayed near the main one.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalCardTemplate = document.getElementById(
            "welcome-page-additional-card-template"
        ) as HTMLTemplateElement;

        /**
         * The template to use as the main content for the welcome page. If
         * not found then only the welcome page head will display.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentTemplate = document.getElementById(
            "welcome-page-additional-content-template"
        ) as HTMLTemplateElement;

        /**
         * The template to use as the additional content for the welcome page header toolbar.
         * If not found then only the settings icon will be displayed.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalToolbarContentTemplate = document.getElementById(
            "settings-toolbar-additional-content-template"
        ) as HTMLTemplateElement;

        // Bind event handlers so they are only bound once per instance.
        this._onRoomChange = this._onRoomChange.bind(this);
        this._setAdditionalCardRef = this._setAdditionalCardRef.bind(this);
        this._setAdditionalContentRef = this._setAdditionalContentRef.bind(this);
        this._setRoomInputRef = this._setRoomInputRef.bind(this);
        this._setAdditionalToolbarContentRef = this._setAdditionalToolbarContentRef.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    async componentDidMount() {
        super.componentDidMount();

        // if (!localStorage.getItem("initExecuted")) {
        //     const url = new URL(location.href);

        //     const jwtParam = url.searchParams.get("jwt") || "";
        //     const keyParam = url.searchParams.get("key") || "";
        //     localStorage.setItem("token", jwtParam);
        //     if (keyParam) localStorage.setItem("key", keyParam.replace(/\//g, ""));

        //     // Set a flag in localStorage to indicate this code has run
        //     localStorage.setItem("initExecuted", "true");
        //     try {
        //         // Wrap each API call in its own try-catch

        //         const [resKey, resToken] = await Promise.allSettled([
        //             baseApi.get(`/meeting/verify-key/${keyParam}`),
        //             baseApi.get(`/auth/validate-token`),
        //         ]);

        //         const isResKeyFailed =
        //             resKey.status === "rejected" || (resKey.status === "fulfilled" && resKey.value.status !== 200);
        //         const isResTokenFailed =
        //             resToken.status === "rejected" ||
        //             (resToken.status === "fulfilled" && resToken.value.status !== 200);

        //         // Redirect if BOTH APIs fail
        //         if (isResKeyFailed && isResTokenFailed) {
        //             window.location.href = "https://spacedesk.sa";
        //         }
        //     } catch (error) {
        //         console.error("Unexpected error occurred:", error);
        //     }
        // }

        this.jwtParam = localStorage.getItem("token");

        try {
            const res = await baseApi.get(`meeting/today`);
            if (res.status === 200) {
                this.setState({
                    meetings: res.data.data || [],
                });
            }
        } catch (error) {
            console.error(error);
        }

        document.body.classList.add("welcome-page");

        if (this.state.generateRoomNames) {
            this._updateRoomName();
        }

        if (this._shouldShowAdditionalContent()) {
            this._additionalContentRef?.appendChild(this._additionalContentTemplate?.content.cloneNode(true) as Node);
        }

        if (this._shouldShowAdditionalToolbarContent()) {
            this._additionalToolbarContentRef?.appendChild(
                this._additionalToolbarContentTemplate?.content.cloneNode(true) as Node
            );
        }

        if (this._shouldShowAdditionalCard()) {
            this._additionalCardRef?.appendChild(this._additionalCardTemplate?.content.cloneNode(true) as Node);
        }
    }

    /**
     * Removes the classname used for custom styling of the welcome page.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        super.componentWillUnmount();

        document.body.classList.remove("welcome-page");
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement|null}
     */
    render() {
        const { _moderatedRoomServiceUrl, t } = this.props;
        const showAdditionalCard = this._shouldShowAdditionalCard();
        const showAdditionalContent = this._shouldShowAdditionalContent();
        const showAdditionalToolbarContent = this._shouldShowAdditionalToolbarContent();

        const obj = localStorage.getItem("features/base/settings");
        const settings = JSON.parse(obj || "{}");
        const tempName = settings.displayName ?? "";
        localStorage.setItem("name", tempName);

        const checkRoom = async () => {
            try {
                const res = await baseApi.get(`/meeting/${this.state.room}`);
                if (res.status === 200) {
                    if (!this._roomInputRef || this._roomInputRef.reportValidity()) {
                        localStorage.setItem("id", this.state.room);
                        this._onJoin(true);
                    }
                }
            } catch (error) {
                this.setState({
                    isExist: true,
                });
            }
            // this._onJoin(true);
        };

        function formatDate(dateString: string, dashFormat?: boolean): string {
            const date = new Date(dateString);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, "0");

            const ampm = hours >= 12 ? "PM" : "AM";

            hours = hours % 12;
            hours = hours ? hours : 12;

            const formattedTime = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;

            if (dashFormat) {
                return `${year}-${month}-${day} ${formattedTime}`;
            }

            return `${year}/${month}/${day} ${formattedTime}`;
        }

        return (
            <div className={"welcome"} id="welcome_page">
                <div className="container_logo">
                    <Watermarks />
                    <div className="invite_container">
                        {!!this.jwtParam && (
                            <InviteButton createMeeting={(mails: string[]) => this._onJoin(false, true, mails)} />
                        )}
                    </div>
                </div>

                <div className="welcome__content">
                    <h1 className="welcome__content__title">Create your Video Calls and meeting</h1>
                    <h5 className="welcome__content__subtitle">
                        Connect, collaborate, and share your ideas with your team.
                    </h5>
                    <div className="create_room">
                        <h6 style={{ color: "black" }}>Create meeting link </h6>
                        <h5 className="welcome__content__subtitle">Integrate Projects Discussions for Soon time </h5>
                        <div className="create_room__controls">
                            {!!this.jwtParam && <MenuPopupState startMeting={() => this._onJoin(false)} />}
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #0f67ad" }}>
                                <input
                                    type="text"
                                    placeholder="Enter your code for meeting"
                                    className="create_room__input"
                                    onChange={this._onRoomChange}
                                    value={this.state.room}
                                />
                                <button
                                    className={`create_room__button-join ${!this.state.room ? "disabled" : ""}`}
                                    onClick={checkRoom}
                                    disabled={!this.state.room} // Disable functionality
                                >
                                    {"Join"}
                                </button>
                            </div>
                        </div>
                        {this.state.isExist && <p style={{ color: "red" }}>invalid room code</p>}
                    </div>
                    {!!this.jwtParam && (
                        <div className="own_card">
                            <h6 style={{ color: "black", alignSelf: "center" }}>Today meetings</h6>
                            {this.state.meetings?.map((val) => (
                                <div key={val.id} className="content">
                                    <span>
                                        <strong>Meeting title :</strong> {val.title}
                                    </span>
                                    <span>
                                        <strong>Started at : </strong>
                                        {formatDate(val.started_at, true)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* <div className="header">
                    <div className="header-image" />
                    <div className="header-container">
                        <div className="header-watermark-container">
                            <div className="welcome-watermark">
                                <Watermarks defaultJitsiLogoURL={DEFAULT_WELCOME_PAGE_LOGO_URL} noMargins={true} />
                            </div>
                        </div>
                        <div className="welcome-page-settings">
                            <SettingsButton defaultTab={SETTINGS_TABS.CALENDAR} isDisplayedOnWelcomePage={true} />
                            {showAdditionalToolbarContent ? (
                                <div className="settings-toolbar-content" ref={this._setAdditionalToolbarContentRef} />
                            ) : null}
                        </div>

                            </div>
                        </div>
                        {this.state.isExist && <p style={{ color: "red" }}>invalid room code</p>}
                    </div>
                </div>

                {/* <div className="header">
                    <div className="header-image" />
                    <div className="header-container">
                        <div className="header-watermark-container">
                            <div className="welcome-watermark">
                                <Watermarks defaultJitsiLogoURL={DEFAULT_WELCOME_PAGE_LOGO_URL} noMargins={true} />
                            </div>
                        </div>
                        <div className="welcome-page-settings">
                            <SettingsButton defaultTab={SETTINGS_TABS.CALENDAR} isDisplayedOnWelcomePage={true} />
                            {showAdditionalToolbarContent ? (
                                <div className="settings-toolbar-content" ref={this._setAdditionalToolbarContentRef} />
                            ) : null}
                        </div>

                        <h1 className="header-text-title">{t("welcomepage.headerTitle")}</h1>
                        <span className="header-text-subtitle">{t("welcomepage.headerSubtitle")}</span>
                        <div id="enter_room">
                            <div className="join-meeting-container">
                                <div className="enter-room-input-container">
                                    <form onSubmit={this._onFormSubmit}>
                                        <input
                                            aria-disabled="false"
                                            aria-label="Meeting name input"
                                            autoFocus={true}
                                            className="enter-room-input"
                                            id="enter_room_field"
                                            onChange={this._onRoomChange}
                                            pattern={ROOM_NAME_VALIDATE_PATTERN_STR}
                                            placeholder={this.state.roomPlaceholder}
                                            ref={this._setRoomInputRef}
                                            type="text"
                                            value={this.state.room}
                                        />
                                    </form>
                                </div>

                                <button
                                    aria-disabled="false"
                                    aria-label="Start meeting"
                                    className="welcome-page-button"
                                    id="enter_room_button"
                                    onClick={this._onFormSubmit}
                                    tabIndex={0}
                                    type="button"
                                >
                                    {t("welcomepage.startMeeting")}
                                </button>
                            </div>
                        </div>
                        {this._titleHasNotAllowCharacter && (
                            <div className="not-allow-title-character-div" role="alert">
                                <Icon src={IconWarning} />
                                <span className="not-allow-title-character-text">
                                    {t("welcomepage.roomNameAllowedChars")}
                                </span>
                            </div>
                        )}
                        {this._renderInsecureRoomNameWarning()}

                        {_moderatedRoomServiceUrl && (
                            <div id="moderated-meetings">
                                {translateToHTML(t, "welcomepage.moderatedMessage", { url: _moderatedRoomServiceUrl })}
                            </div>
                        )}
                    </div>
                </div> */}
            </div>
        );
    }

    /**
     * Renders the insecure room name warning.
     *
     * @inheritdoc
     */
    _doRenderInsecureRoomNameWarning() {
        return (
            <div className="insecure-room-name-warning">
                <Icon src={IconWarning} />
                <span>{getUnsafeRoomText(this.props.t, "welcome")}</span>
            </div>
        );
    }

    /**
     * Prevents submission of the form and delegates join logic.
     *
     * @param {Event} event - The HTML Event which details the form submission.
     * @private
     * @returns {void}
     */

    // _onFormSubmit(event: React.FormEvent) {
    //     event.preventDefault();

    //     return false;
    //     if (!this._roomInputRef || this._roomInputRef.reportValidity()) {
    //         this._onJoin();
    //     }
    // }

    /**
     * Overrides the super to account for the differences in the argument types
     * provided by HTML and React Native text inputs.
     *
     * @inheritdoc
     * @override
     * @param {Event} event - The (HTML) Event which details the change such as
     * the EventTarget.
     * @protected
     */
    // @ts-ignore
    // eslint-disable-next-line require-jsdoc
    _onRoomChange(event: React.ChangeEvent<HTMLInputElement>) {
        const specialCharacters = ["?", "&", ":", "'", '"', "%", "#", "."];

        this._titleHasNotAllowCharacter = specialCharacters.some((char) => event.target.value.includes(char));
        super._onRoomChange(event.target.value);
    }

    /**
     * Renders the footer.
     *
     * @returns {ReactElement}
     */
    _renderFooter() {
        const {
            t,
            _deeplinkingCfg: {
                ios = { downloadLink: undefined },
                android = {
                    fDroidUrl: undefined,
                    downloadLink: undefined,
                },
            },
        } = this.props;

        const { downloadLink: iosDownloadLink } = ios;

        const { fDroidUrl, downloadLink: androidDownloadLink } = android;

        return (
            <footer className="welcome-footer">
                <div className="welcome-footer-centered">
                    <div className="welcome-footer-padded">
                        <div className="welcome-footer-row-block welcome-footer--row-1">
                            <div className="welcome-footer-row-1-text">{t("welcomepage.jitsiOnMobile")}</div>
                            <a className="welcome-badge" href={iosDownloadLink}>
                                <img alt={t("welcomepage.mobileDownLoadLinkIos")} src="./images/app-store-badge.png" />
                            </a>
                            <a className="welcome-badge" href={androidDownloadLink}>
                                <img
                                    alt={t("welcomepage.mobileDownLoadLinkAndroid")}
                                    src="./images/google-play-badge.png"
                                />
                            </a>
                            <a className="welcome-badge" href={fDroidUrl}>
                                <img alt={t("welcomepage.mobileDownLoadLinkFDroid")} src="./images/f-droid-badge.png" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    /**
     * Renders tabs to show previous meetings and upcoming calendar events. The
     * tabs are purposefully hidden on mobile browsers.
     *
     * @returns {ReactElement|null}
     */
    _renderTabs() {
        if (isMobileBrowser()) {
            return null;
        }

        const { _calendarEnabled, _recentListEnabled, t } = this.props;

        const tabs = [];

        if (_calendarEnabled) {
            tabs.push({
                id: "calendar",
                label: t("welcomepage.upcomingMeetings"),
                content: <CalendarList />,
            });
        }

        if (_recentListEnabled) {
            tabs.push({
                id: "recent",
                label: t("welcomepage.recentMeetings"),
                content: <RecentList />,
            });
        }

        if (tabs.length === 0) {
            return null;
        }

        return <Tabs accessibilityLabel={t("welcomepage.meetingsAccessibilityLabel")} tabs={tabs} />;
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * additional card shown near the tabs card.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the welcome page content.
     * @private
     * @returns {void}
     */
    _setAdditionalCardRef(el: HTMLDivElement) {
        this._additionalCardRef = el;
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * welcome page content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the welcome page content.
     * @private
     * @returns {void}
     */
    _setAdditionalContentRef(el: HTMLDivElement) {
        this._additionalContentRef = el;
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * toolbar additional content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the additional toolbar content.
     * @private
     * @returns {void}
     */
    _setAdditionalToolbarContentRef(el: HTMLDivElement) {
        this._additionalToolbarContentRef = el;
    }

    /**
     * Sets the internal reference to the HTMLInputElement used to hold the
     * welcome page input room element.
     *
     * @param {HTMLInputElement} el - The HTMLElement for the input of the room name on the welcome page.
     * @private
     * @returns {void}
     */
    _setRoomInputRef(el: HTMLInputElement) {
        this._roomInputRef = el;
    }

    /**
     * Returns whether or not an additional card should be displayed near the tabs.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalCard() {
        return (
            interfaceConfig.DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD &&
            this._additionalCardTemplate &&
            this._additionalCardTemplate.content &&
            this._additionalCardTemplate.innerHTML.trim()
        );
    }

    /**
     * Returns whether or not additional content should be displayed below
     * the welcome page's header for entering a room name.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalContent() {
        return (
            interfaceConfig.DISPLAY_WELCOME_PAGE_CONTENT &&
            this._additionalContentTemplate &&
            this._additionalContentTemplate.content &&
            this._additionalContentTemplate.innerHTML.trim()
        );
    }

    /**
     * Returns whether or not additional content should be displayed inside
     * the header toolbar.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalToolbarContent() {
        return (
            interfaceConfig.DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT &&
            this._additionalToolbarContentTemplate &&
            this._additionalToolbarContentTemplate.content &&
            this._additionalToolbarContentTemplate.innerHTML.trim()
        );
    }
}

export default translate(connect(_mapStateToProps)(WelcomePage));
