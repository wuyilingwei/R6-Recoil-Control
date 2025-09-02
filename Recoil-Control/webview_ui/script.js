window.addEventListener('pywebviewready', function() {
    const api = window.pywebview.api;

    function showMessage(message, type = 'info') {
        const container = document.body;
        const messageDiv = document.createElement('div');
        messageDiv.className = `toast-notification ${type}`;

        const iconDiv = document.createElement('div');
        iconDiv.className = 'toast-icon';
        let icon = '';
        if (type === 'success') {
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        } else if (type === 'error') {
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
        } else {
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }
        iconDiv.innerHTML = icon;

        const textDiv = document.createElement('div');
        textDiv.className = 'toast-text';
        textDiv.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(110%)';
            setTimeout(() => {
                if (container.contains(messageDiv)) {
                    container.removeChild(messageDiv);
                }
            }, 500);
        };

        messageDiv.appendChild(iconDiv);
        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(closeButton);
        
        container.appendChild(messageDiv);

        setTimeout(() => {
            closeButton.click();
        }, 5000);
    }

    const toggleButton = document.getElementById('toggle-recoil-btn');
    const navRecoilBtn = document.getElementById('nav-recoil-btn');
    const navPresetsBtn = document.getElementById('nav-presets-btn');
    const navMacrosBtn = document.getElementById('nav-macros-btn');
    const navOverlayBtn = document.getElementById('nav-overlay-btn');
    const navAiBtn = document.getElementById('nav-ai-btn');
    const navAboutBtn = document.getElementById('nav-about-btn');
    const navSettingsBtn = document.getElementById('nav-settings-btn');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const appLayout = document.querySelector('.app-layout');
    const btnMin = document.getElementById('btn-min');
    const btnMax = document.getElementById('btn-max');
    const btnClose = document.getElementById('btn-close');
    const topActions = document.getElementById('top-actions');

    const recoilControlsSection = document.getElementById('recoil-controls-section');
    const presetsSection = document.getElementById('presets-section');
    const overlaySection = document.getElementById('overlay-section');
    const aiChatSection = document.getElementById('ai-chat-section');
    const settingsSection = document.getElementById('settings-section');
    const macrosSection = document.getElementById('macros-section');
    
    const macroAutoClick = document.getElementById('macro-auto-click');
    
    const overlayEnabled = document.getElementById('overlay-enabled');
    const overlayZoomLevel = document.getElementById('overlay-zoom-level');
    const overlayZoomLevelValue = document.getElementById('overlay-zoom-level-value');
    const overlayTabs = document.getElementById('overlay-tabs');
    const overlayTabAttackers = document.getElementById('overlay-tab-attackers');
    const overlayTabDefenders = document.getElementById('overlay-tab-defenders');
    const overlayAgentGrid = document.getElementById('overlay-agent-grid');

    const primaryWeaponBtn = document.getElementById('primary-weapon-btn');
    const secondaryWeaponBtn = document.getElementById('secondary-weapon-btn');
    const primaryControls = document.getElementById('primary-controls');
    const secondaryControls = document.getElementById('secondary-controls');
    const weaponTabPrimaryBtn = document.getElementById('weapon-tab-primary');
    const weaponTabSecondaryBtn = document.getElementById('weapon-tab-secondary');
    const primaryVerticalGroup = document.getElementById('primary-vertical');
    const primaryHorizontalGroup = document.getElementById('primary-horizontal');

    const navRecoilPrimaryBtn = null;
    const navRecoilSecondaryBtn = null;
    const miniPrimaryBtn = null;
    const miniSecondaryBtn = null;
    const recoilNavGroup = navRecoilBtn ? navRecoilBtn.closest('.nav-group') : null;

    const primaryRecoilY = document.getElementById('primary-recoil-y');
    const primaryRecoilYValue = document.getElementById('primary-recoil-y-value');
    const primaryRecoilX = document.getElementById('primary-recoil-x');
    const primaryRecoilXValue = document.getElementById('primary-recoil-x-value');

    const secondaryWeaponEnabled = document.getElementById('secondary-weapon-enabled');
    const secondaryRecoilY = document.getElementById('secondary-recoil-y');
    const secondaryRecoilYValue = document.getElementById('secondary-recoil-y-value');
    const secondaryRecoilX = document.getElementById('secondary-recoil-x');
    const secondaryRecoilXValue = document.getElementById('secondary-recoil-x-value');

    const tbagEnabled = document.getElementById('tbag-enabled');
    const tbagKey = document.getElementById('tbag-key');
    

    const presetsTabs = document.getElementById('presets-tabs');
    const tabAttackers = document.getElementById('tab-attackers');
    const tabDefenders = document.getElementById('tab-defenders');
    const tabSavedPresets = document.getElementById('tab-saved-presets');
    const tabCommunity = document.getElementById('tab-community');
    const agentGridContainer = document.getElementById('agent-grid-container');
    const communitySection = document.getElementById('community-presets-section');
    const communityGrid = document.getElementById('community-grid');
    const communitySearch = document.getElementById('community-search');
    const communityAgentFilter = document.getElementById('community-agent-filter');
    const publishBtn = document.getElementById('community-publish-btn');
    const publishModal = document.getElementById('publish-modal');
    const publishPresetSelect = document.getElementById('publish-preset-select');
    const publishNameInput = document.getElementById('publish-name-input');
    const publishConfirmBtn = document.getElementById('publish-confirm-btn');
    const publishCancelBtn = document.getElementById('publish-cancel-btn');
    const presetManagementSection = document.getElementById('preset-management-section');
    const selectedAgentNameSpan = document.getElementById('selected-agent-name');
    const newPresetNameInput = document.getElementById('new-preset-name');
    const savePresetBtn = document.getElementById('save-preset-btn');
    const existingPresetsDropdown = document.getElementById('existing-presets-dropdown');
    const loadPresetBtn = document.getElementById('load-preset-btn');
    const deletePresetBtn = document.getElementById('delete-preset-btn');

    const chatHistoryDiv = document.getElementById('chat-history');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    

    const pinModal = document.getElementById('pin-modal');
    const pinInput = document.getElementById('pin-input');
    const submitPinBtn = document.getElementById('submit-pin-btn');
    const cancelPinBtn = document.getElementById('cancel-pin-btn');
    const pinModalCloseBtn = document.getElementById('pin-modal-close');

    const howToAuthModal = document.getElementById('how-to-auth-modal');
    const howToAuthLink = document.getElementById('how-to-auth-link');
    const howToAuthCloseBtn = document.getElementById('how-to-auth-close');

    const mpdCountSpan = document.getElementById('mpd-count');
    const mpdMaxSpan = document.getElementById('mpd-max');

    let mpdCache = {};
    const modelLimits = { 'recoil-ai': 50, 'thinking': 5 };

    const updateMpdDisplay = (model) => {
        const count = mpdCache[model] !== undefined ? mpdCache[model] : '--';
        const max = modelLimits[model] || 50;
        if (mpdCountSpan) mpdCountSpan.textContent = count;
        if (mpdMaxSpan) mpdMaxSpan.textContent = max;
    };

    const updateMpdCache = (recoilAiCount, thinkingCount) => {
        if (recoilAiCount !== undefined) mpdCache['recoil-ai'] = recoilAiCount;
        if (thinkingCount !== undefined) mpdCache['thinking'] = thinkingCount;
    };

    const customSelect = document.getElementById('custom-ai-model-select');
    if (customSelect) {
        const selected = customSelect.querySelector('.select-selected');
        const items = customSelect.querySelector('.select-items');
        const options = items.querySelectorAll('div[data-value]');
        const hiddenInput = document.getElementById('ai-model-select-value');

        const setupTooltip = (optionElement) => {
            if (!optionElement) return;

            const tooltip = optionElement.querySelector('.model-tooltip');
            if (!tooltip) return;

            let tooltipTimeout;

            optionElement.addEventListener('mouseenter', () => {
                tooltipTimeout = setTimeout(() => {
                    tooltip.style.display = 'block';
                }, 350);
            });

            optionElement.addEventListener('mouseleave', () => {
                clearTimeout(tooltipTimeout);
                tooltip.style.display = 'none';
            });
        };

        options.forEach(option => {
            setupTooltip(option);
            option.addEventListener('click', () => {
                selected.querySelector('span').textContent = option.childNodes[0].textContent.trim();
                hiddenInput.value = option.getAttribute('data-value');
                items.classList.add('select-hide');
                selected.classList.remove('open');
                updateMpdDisplay(hiddenInput.value);
            });
        });

        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            items.classList.toggle('select-hide');
            selected.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            if (!items.classList.contains('select-hide')) {
                items.classList.add('select-hide');
                selected.classList.remove('open');
            }
        });
    }

    const aboutModal = document.getElementById('about-modal');
    const appVersionSpan = document.getElementById('app-version');
    const doNotShowAboutAgainCheckbox = document.getElementById('do-not-show-about-again');
    const closeAboutModalBtn = document.getElementById('close-about-modal-btn');

    const settingsTabs = document.getElementById('settings-tabs');
    const settingsTabHotkeys = document.getElementById('settings-tab-hotkeys');
    const settingsTabGeneral = document.getElementById('settings-tab-general');
    const settingsTabLanguages = document.getElementById('settings-tab-languages');
    const settingsTabCommands = null;
    const panelHotkeys = document.getElementById('settings-hotkeys');
    const panelGeneral = document.getElementById('settings-general');
    const panelLanguages = document.getElementById('settings-languages');
    const settingsPanelsInner = document.getElementById('settings-panels-inner');
    const settingsTitle = document.querySelector('.settings-title');
    const inputDpi = document.getElementById('setting-dpi');
    const inputSens = document.getElementById('setting-sens');
    const hotkeyPrimary1 = document.getElementById('hotkey-primary-1');
    const hotkeySecondary1 = document.getElementById('hotkey-secondary-1');
    const hotkeyToggle = document.getElementById('hotkey-toggle');
    const hotkeyTbag = document.getElementById('hotkey-tbag');
    const hotkeyOverlayToggle = document.getElementById('hotkey-overlay-toggle');
    const hotkeyOverlayStep = document.getElementById('hotkey-overlay-step');

    const rateAppModal = document.getElementById('rate-app-modal');
    const rateAppModalClose = document.getElementById('rate-app-modal-close');
    const showRatePopupBtn = document.getElementById('show-rate-popup-btn');
    const rateAppIconsContainer = document.getElementById('rate-app-icons');
    const rateAppSubmitBtn = document.getElementById('rate-app-submit-btn');
    const rateAppDontShowCheckbox = document.getElementById('rate-app-dont-show-again');

    let currentSettings = {};
    let selectedAgent = null;
    let chatHistoryList = [];
    let currentPresetsSubtab;
    let translations = {};
    

    async function fetchTranslations(lang) {
        try {
            const response = await fetch(`./translations/${lang}.json`);
            if (!response.ok) {
                console.error(`Could not load ${lang}.json`);
                return {};
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching translations for ${lang}:`, error);
            return {};
        }
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.placeholder) {
                    element.placeholder = translations[key];
                } else {
                    element.innerHTML = translations[key];
                }
            }
        });

        document.querySelectorAll('[data-i18n-tooltip]').forEach(element => {
            const key = element.getAttribute('data-i18n-tooltip');
            if (translations[key]) {
                element.setAttribute('data-tooltip', translations[key]);
            }
        });
    }

    async function setLanguage(lang) {
        translations = await fetchTranslations(lang);
        applyTranslations();
    }

    function switchWeaponView(weapon, sendToPython = true) {
        currentSettings.active_weapon = weapon;
        if (weapon === 'primary') {
            if (primaryWeaponBtn) primaryWeaponBtn.classList.add('active');
            if (secondaryWeaponBtn) secondaryWeaponBtn.classList.remove('active');
            if (weaponTabPrimaryBtn) weaponTabPrimaryBtn.classList.add('active');
            if (weaponTabSecondaryBtn) weaponTabSecondaryBtn.classList.remove('active');
            if (primaryControls) primaryControls.style.display = 'block';
            if (secondaryControls) secondaryControls.style.display = 'block';
        } else {
            if (secondaryWeaponBtn) secondaryWeaponBtn.classList.add('active');
            if (primaryWeaponBtn) primaryWeaponBtn.classList.remove('active');
            if (weaponTabSecondaryBtn) weaponTabSecondaryBtn.classList.add('active');
            if (weaponTabPrimaryBtn) weaponTabPrimaryBtn.classList.remove('active');
            if (primaryControls) primaryControls.style.display = 'block';
            if (secondaryControls) secondaryControls.style.display = 'block';
        }
        if (sendToPython) {
            api.apply_settings({ 'active_weapon': weapon });
        }
    };

    window.updateUIFromPython = (settings) => {
        api.log_message('Updating UI from Python...');
        console.log('Received settings:', settings);
        currentSettings = settings;
        recordedSettings = {...settings};
        const num = (v, d = 0) => {
            const n = typeof v === 'number' ? v : parseFloat(v);
            return Number.isFinite(n) ? n : d;
        };

        if (typeof settings.setting_dpi !== 'undefined' || typeof settings.dpi !== 'undefined' || typeof settings.mouse_dpi !== 'undefined') {
            const dpiVal = settings.setting_dpi ?? settings.dpi ?? settings.mouse_dpi;
            if (inputDpi) inputDpi.value = dpiVal ?? '';
        }
        if (typeof settings.setting_sens !== 'undefined' || typeof settings.sens !== 'undefined' || typeof settings.sensitivity !== 'undefined') {
            const sensVal = settings.setting_sens ?? settings.sens ?? settings.sensitivity;
            if (inputSens) inputSens.value = sensVal ?? '';
        }

        if (primaryRecoilY && primaryRecoilX) {
            const pry = num(settings.primary_recoil_y);
            const prx = num(settings.primary_recoil_x);
            primaryRecoilY.value = pry * 100;
            if (primaryRecoilYValue) primaryRecoilYValue.textContent = pry.toFixed(3);
            primaryRecoilX.value = prx * 1000;
            if (primaryRecoilXValue) primaryRecoilXValue.textContent = prx.toFixed(3);
        }

        if (secondaryRecoilY && secondaryRecoilX) {
            const sry = num(settings.secondary_recoil_y);
            const srx = num(settings.secondary_recoil_x);
            secondaryRecoilY.value = sry * 100;
            if (secondaryRecoilYValue) secondaryRecoilYValue.textContent = sry.toFixed(3);
            secondaryRecoilX.value = srx * 1000;
            if (secondaryRecoilXValue) secondaryRecoilXValue.textContent = srx.toFixed(3);
        }

        if (tbagEnabled) tbagEnabled.checked = !!settings.t_bag_enabled;
        if (tbagKey) tbagKey.value = (settings.t_bag_key && settings.t_bag_key[0]) || '';
        if (macroAutoClick) macroAutoClick.checked = !!settings.macro_auto_click;
        

        if (overlayEnabled) overlayEnabled.checked = !!settings.overlay_enabled;
        if (overlayZoomLevel) {
            const zoom = num(settings.overlay_zoom_level, 1.0);
            overlayZoomLevel.value = zoom * 100;
            if(overlayZoomLevelValue) overlayZoomLevelValue.textContent = zoom.toFixed(1);
        }

        switchWeaponView(settings.active_weapon || 'primary', false);

        if (hotkeyPrimary1) hotkeyPrimary1.value = (settings.primary_weapon_hotkey && settings.primary_weapon_hotkey[0]) || '';
        if (hotkeySecondary1) hotkeySecondary1.value = (settings.secondary_weapon_hotkey && settings.secondary_weapon_hotkey[0]) || '';
        if (hotkeyToggle) hotkeyToggle.value = (settings.toggle_hotkey && settings.toggle_hotkey[0]) || '';
        if (hotkeyTbag) hotkeyTbag.value = (settings.t_bag_hotkey && settings.t_bag_hotkey[0]) || '';
        if (hotkeyOverlayToggle) hotkeyOverlayToggle.value = (settings.overlay_toggle_hotkey && settings.overlay_toggle_hotkey[0]) || '';
        if (hotkeyOverlayStep) hotkeyOverlayStep.value = (settings.overlay_step_hotkey && settings.overlay_step_hotkey[0]) || '';

        if (doNotShowAboutAgainCheckbox) doNotShowAboutAgainCheckbox.checked = !settings.show_about_on_startup;
        if (appVersionSpan && settings.app_version != null) appVersionSpan.textContent = settings.app_version;

        const lang = settings.language || 'en';
        const languageCards = document.querySelectorAll('.language-card');
        languageCards.forEach(card => {
            if (card.dataset.lang === lang) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        try {
            const pubBtn = document.getElementById('community-publish-btn');
            if (pubBtn) {
                const isAuthed = !!(settings.discord_user_id);
                pubBtn.disabled = !isAuthed;
                pubBtn.title = isAuthed ? '' : 'Sign in with Discord to publish presets';
            }
        } catch (e) { /* ignore */ }
        updateLoginState(settings);
    };

    const updateLoginState = (settings) => {
        const accountLoginBtn = document.getElementById('account-login-btn');
        const userInfoDiv = document.getElementById('discord-user-info');

        if (settings && settings.discord_username) {
            accountLoginBtn.textContent = 'Logout';
            accountLoginBtn.classList.add('btn-danger');
            accountLoginBtn.classList.remove('btn-primary');
            userInfoDiv.textContent = settings.discord_username;
        } else {
            accountLoginBtn.textContent = 'Login with Discord';
            accountLoginBtn.classList.remove('btn-danger');
            accountLoginBtn.classList.add('btn-primary');
            userInfoDiv.textContent = '';
        }
    };

    const showPinModal = () => {
        return new Promise((resolve) => {
            pinModal.style.display = 'flex';
            pinInput.value = '';

            const handleSubmit = async () => {
                const pin = pinInput.value.trim();
                if (!pin) {
                    const pinError = document.getElementById('pin-error');
                    if (pinError) {
                        pinError.textContent = 'Please enter a PIN.';
                        pinError.style.display = 'block';
                        setTimeout(() => { pinError.style.display = 'none'; }, 5000);
                    } else {
                        showMessage('Please enter a PIN.', 'warning');
                    }
                    return;
                }
                let response;
                try {
                    response = await api.check_pin_auth(pin);
                } catch (error) {
                    const pinError = document.getElementById('pin-error');
                    if (pinError) {
                        pinError.textContent = 'Authentication service unavailable.';
                        pinError.style.display = 'block';
                        setTimeout(() => { pinError.style.display = 'none'; }, 5000);
                    } else {
                        showMessage('Authentication service unavailable.', 'error');
                    }
                    resolve(null);
                    return;
                }
                if (response && response.success) {
                    showMessage('Authentication successful!', 'success');
                    pinModal.style.display = 'none';
                    resolve(response.data);
                } else {
                    showMessage(response.message || 'Invalid PIN or authentication failed.', 'error');
                    resolve(null);
                }
            };

            const handleCancel = () => {
                pinModal.style.display = 'none';
                resolve(null);
            };

            if (submitPinBtn) submitPinBtn.removeEventListener('click', handleSubmit);
            if (cancelPinBtn) cancelPinBtn.removeEventListener('click', handleCancel);
            if (pinModalCloseBtn) pinModalCloseBtn.removeEventListener('click', handleCancel);
            if (pinInput) pinInput.removeEventListener('keypress', handleSubmit);

            if (submitPinBtn) submitPinBtn.addEventListener('click', handleSubmit);
            if (cancelPinBtn) cancelPinBtn.addEventListener('click', handleCancel);
            if (pinModalCloseBtn) pinModalCloseBtn.addEventListener('click', handleCancel);
            if (pinInput) {
                pinInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        handleSubmit();
                    }
                });
            }
        });
    };

    const showAboutModal = () => {
        api.get_settings().then(settings => {
            appVersionSpan.textContent = settings.app_version;
            doNotShowAboutAgainCheckbox.checked = !settings.show_about_on_startup;
            aboutModal.style.display = 'flex';
        });
    };

    const accountLoginBtn = document.getElementById('account-login-btn');
    if (accountLoginBtn) {
        accountLoginBtn.addEventListener('click', async () => {
            const is_logged_in = (currentSettings && currentSettings.discord_user_id);

            if (is_logged_in) {
                const response = await api.logout();
                if (response && response.success) {
                    currentSettings.discord_user_id = null;
                    currentSettings.discord_username = null;
                    currentSettings.app_id = null;
                    updateLoginState(currentSettings);
                    showMessage('Logged out successfully.', 'info');
                } else {
                    showMessage('Logout failed.', 'error');
                }
            } else {
                const userData = await showPinModal();
                if (userData) {
                    const updatedSettings = await api.get_settings();
                    currentSettings = updatedSettings;
                    updateLoginState(updatedSettings);
                }
            }
        });
    };

    window.updateToggleButtonState = (isActive) => {
        if (isActive) {
            toggleButton.textContent = 'ENABLED';
            toggleButton.classList.remove('btn-danger');
            toggleButton.classList.add('btn-success');
        } else {
            toggleButton.textContent = 'DISABLED';
            toggleButton.classList.remove('btn-success');
            toggleButton.classList.add('btn-danger');
        }
    };

    window.updateOverlayButtonState = (isActive) => {
        const toggleOverlayBtn = document.getElementById('toggle-overlay-btn');
        if (toggleOverlayBtn) {
            if (isActive) {
                toggleOverlayBtn.textContent = 'Overlay ON';
                toggleOverlayBtn.classList.remove('btn-danger');
                toggleOverlayBtn.classList.add('btn-success');
            } else {
                toggleOverlayBtn.textContent = 'Overlay OFF';
                toggleOverlayBtn.classList.remove('btn-success');
                toggleOverlayBtn.classList.add('btn-danger');
            }
        }
    };

    window.updateOnlineCount = (count) => {
        const countElement = document.getElementById('online-count');
        if (countElement) {
            countElement.textContent = count;
        }
    };

    if (rateAppSubmitBtn) {
        rateAppSubmitBtn.addEventListener('click', () => {
            if (currentRating > 0) {
                api.send_rating(currentRating);
                showMessage(`Thank you for your rating of ${currentRating} out of 5!`, 'success');
            } else if (rateAppDontShowCheckbox.checked) {
                showMessage('Your preference has been saved.', 'info');
            }
            handlePopupClose(true);
        });
    }
    

    const handleSettingChange = () => {
        const isPrimaryActive = (() => {
            const tabs = document.getElementById('weapon-tabs');
            if (tabs) return !tabs.classList.contains('right-active');
            return (currentSettings.active_weapon || 'primary') === 'primary';
        })();

        const newSettings = {
            ...currentSettings,
            primary_recoil_y: parseFloat((primaryRecoilYValue && primaryRecoilYValue.textContent) || 0),
            primary_recoil_x: parseFloat((primaryRecoilXValue && primaryRecoilXValue.textContent) || 0),
            secondary_recoil_y: parseFloat((secondaryRecoilYValue && secondaryRecoilYValue.textContent) || 0),
            secondary_recoil_x: parseFloat((secondaryRecoilXValue && secondaryRecoilXValue.textContent) || 0),
            t_bag_enabled: tbagEnabled ? !!tbagEnabled.checked : !!currentSettings.t_bag_enabled,
            macro_auto_click: macroAutoClick ? !!macroAutoClick.checked : !!currentSettings.macro_auto_click,
            
            overlay_enabled: overlayEnabled ? !!overlayEnabled.checked : !!currentSettings.overlay_enabled,
            overlay_zoom_level: parseFloat((overlayZoomLevelValue && overlayZoomLevelValue.textContent) || 1.0),
            active_weapon: isPrimaryActive ? 'primary' : 'secondary',
            show_about_on_startup: doNotShowAboutAgainCheckbox ? !doNotShowAboutAgainCheckbox.checked : currentSettings.show_about_on_startup
        };
        api.apply_settings(newSettings);
    };

    const languageGrid = document.querySelector('.language-grid');
    if (languageGrid) {
        languageGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.language-card');
            if (card) {
                const lang = card.dataset.lang;
                const newSettings = { ...currentSettings, language: lang };
                api.apply_settings(newSettings);
                const languageCards = document.querySelectorAll('.language-card');
                languageCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                setLanguage(lang);
            }
        });
    }

const showTab = (tabId) => {
    if (recoilControlsSection) recoilControlsSection.style.display = 'none';
    if (topActions) topActions.style.display = 'none';
    if (presetsSection) presetsSection.style.display = 'none';
    if (overlaySection) overlaySection.style.display = 'none';
    if (aiChatSection) aiChatSection.style.display = 'none';
    if (settingsSection) settingsSection.style.display = 'none';
    if (macrosSection) macrosSection.style.display = 'none';
    if (aboutModal) aboutModal.style.display = 'none';

    if (navRecoilBtn) navRecoilBtn.classList.remove('active');
    if (navPresetsBtn) navPresetsBtn.classList.remove('active');
    if (navMacrosBtn) navMacrosBtn.classList.remove('active');
    if (navOverlayBtn) navOverlayBtn.classList.remove('active');
    if (navAiBtn) navAiBtn.classList.remove('active');
    if (navAboutBtn) navAboutBtn.classList.remove('active');
    if (navSettingsBtn) navSettingsBtn.classList.remove('active');

    if (tabId === 'recoil') {
        if (recoilControlsSection) recoilControlsSection.style.display = 'block';
        if (topActions) topActions.style.display = 'grid';
        if (navRecoilBtn) navRecoilBtn.classList.add('active');
    } else if (tabId === 'presets') {
        if (presetsSection) presetsSection.style.display = 'block';
        if (navPresetsBtn) navPresetsBtn.classList.add('active');
        
        if (!currentPresetsSubtab) {
            currentPresetsSubtab = 'attackers';
        }
        
        if (currentPresetsSubtab === 'attackers') {
            if (tabAttackers) tabAttackers.classList.add('active');
            if (tabDefenders) tabDefenders.classList.remove('active');
            if (tabCommunity) tabCommunity.classList.remove('active');
            if (agentGridContainer) agentGridContainer.style.display = '';
            if (communitySection) communitySection.style.display = 'none';
            loadAgentIcons('attackers');
        } else if (currentPresetsSubtab === 'defenders') {
            if (tabDefenders) tabDefenders.classList.add('active');
            if (tabAttackers) tabAttackers.classList.remove('active');
            if (tabCommunity) tabCommunity.classList.remove('active');
            if (agentGridContainer) agentGridContainer.style.display = '';
            if (communitySection) communitySection.style.display = 'none';
            loadAgentIcons('defenders');
        } else if (currentPresetsSubtab === 'community') {
            if (tabCommunity) tabCommunity.classList.add('active');
            if (tabAttackers) tabAttackers.classList.remove('active');
            if (tabDefenders) tabDefenders.classList.remove('active');
            if (agentGridContainer) agentGridContainer.style.display = 'none';
            if (communitySection) communitySection.style.display = '';
            loadCommunityPresets();
        }
        
        if (presetsTabs) {
            presetsTabs.classList.remove('center-active');
            presetsTabs.classList.remove('rightmost');
        }
        if (presetManagementSection) presetManagementSection.style.display = 'none';
        if (recoilNavGroup) recoilNavGroup.classList.remove('open');
    } else if (tabId === 'overlay') {
        if (overlaySection) overlaySection.style.display = 'block';
        if (navOverlayBtn) navOverlayBtn.classList.add('active');
        loadOverlayAgentIcons('attackers');
    } else if (tabId === 'ai-chat') {
        if (aiChatSection) aiChatSection.style.display = 'flex';
        if (navAiBtn) navAiBtn.classList.add('active');
        if (recoilNavGroup) recoilNavGroup.classList.remove('open');
    } else if (tabId === 'about' && aboutModal && navAboutBtn) {
        showAboutModal();
        navAboutBtn.classList.add('active');
        if (recoilNavGroup) recoilNavGroup.classList.remove('open');
    } else if (tabId === 'settings') {
        if (settingsSection) settingsSection.style.display = 'block';
        if (navSettingsBtn) navSettingsBtn.classList.add('active');
        if (recoilNavGroup) recoilNavGroup.classList.remove('open');
    } else if (tabId === 'macros') {
        if (macrosSection) macrosSection.style.display = 'block';
        if (navMacrosBtn) navMacrosBtn.classList.add('active');
        if (recoilNavGroup) recoilNavGroup.classList.remove('open');
    }
};

    if (settingsTabHotkeys) settingsTabHotkeys.addEventListener('click', () => {
        settingsTabHotkeys.classList.add('active');
        if (settingsTabGeneral) settingsTabGeneral.classList.remove('active');
        if (settingsTabLanguages) settingsTabLanguages.classList.remove('active');
        if (settingsTabCommands) settingsTabCommands.classList.remove('active');
        if (settingsPanelsInner) {
            settingsPanelsInner.classList.add('show-hotkeys');
            settingsPanelsInner.classList.remove('show-commands');
            settingsPanelsInner.classList.remove('show-languages');
        }
        if (settingsTabs) {
            settingsTabs.classList.remove('center-active');
            settingsTabs.classList.add('right-active');
        }
        if (settingsTitle) settingsTitle.textContent = 'Hotkeys';
    });
    if (settingsTabGeneral) settingsTabGeneral.addEventListener('click', () => {
        settingsTabGeneral.classList.add('active');
        if (settingsTabHotkeys) settingsTabHotkeys.classList.remove('active');
        if (settingsTabLanguages) settingsTabLanguages.classList.remove('active');
        if (settingsTabCommands) settingsTabCommands.classList.remove('active');
        if (settingsPanelsInner) {
            settingsPanelsInner.classList.remove('show-hotkeys');
            settingsPanelsInner.classList.remove('show-commands');
            settingsPanelsInner.classList.remove('show-languages');
        }
        if (settingsTabs) {
            settingsTabs.classList.remove('center-active');
            settingsTabs.classList.remove('right-active');
        }
        if (settingsTitle) settingsTitle.textContent = 'General';
    });

    if (settingsTabLanguages) settingsTabLanguages.addEventListener('click', () => {
        settingsTabLanguages.classList.add('active');
        if (settingsTabGeneral) settingsTabGeneral.classList.remove('active');
        if (settingsTabHotkeys) settingsTabHotkeys.classList.remove('active');
        if (settingsTabCommands) settingsTabCommands.classList.remove('active');
        if (settingsPanelsInner) {
            settingsPanelsInner.classList.remove('show-hotkeys');
            settingsPanelsInner.classList.remove('show-commands');
            settingsPanelsInner.classList.add('show-languages');
        }
        if (settingsTabs) {
            settingsTabs.classList.add('center-active');
            settingsTabs.classList.remove('right-active');
        }
        if (settingsTitle) settingsTitle.textContent = 'Languages';
    });

    let weaponState = 'primary';

    const toggleWeapon = () => {
        weaponState = weaponState === 'primary' ? 'secondary' : 'primary';
        console.log('Toggling weapon to:', weaponState);
        
        const newSettings = {
            ...currentSettings,
            active_weapon: weaponState
        };
        
        if (weaponState === 'primary') {
            document.getElementById('weapon-tab-primary').classList.add('active');
            document.getElementById('weapon-tab-secondary').classList.remove('active');
            document.getElementById('weapon-panels-inner').classList.remove('show-secondary');
        } else {
            document.getElementById('weapon-tab-primary').classList.remove('active');
            document.getElementById('weapon-tab-secondary').classList.add('active');
            document.getElementById('weapon-panels-inner').classList.add('show-secondary');
        }
        
        api.apply_settings(newSettings);
    };

    const bindHotkeyCapture = (inputEl, settingsKeyArrayName) => {
        if (!inputEl) return;
        inputEl.addEventListener('focus', () => {
            inputEl.value = '';
        });
        inputEl.addEventListener('keydown', (e) => {
            e.preventDefault();
            const key = e.key.toUpperCase();
            inputEl.value = key;
            const newSettings = { ...currentSettings };
            newSettings[settingsKeyArrayName] = [key];
            api.apply_settings(newSettings).then(() => api.get_settings().then(updateUIFromPython));
        });
    };

    bindHotkeyCapture(hotkeyPrimary1, 'primary_weapon_hotkey');
    bindHotkeyCapture(hotkeySecondary1, 'secondary_weapon_hotkey');
    bindHotkeyCapture(hotkeyToggle, 'toggle_hotkey');
    bindHotkeyCapture(hotkeyTbag, 't_bag_hotkey');
    bindHotkeyCapture(tbagKey, 't_bag_key');
    bindHotkeyCapture(hotkeyOverlayToggle, 'overlay_toggle_hotkey');
    bindHotkeyCapture(hotkeyOverlayStep, 'overlay_step_hotkey');

    const persistSetting = (key, value) => {
        const newSettings = { ...currentSettings };
        newSettings[key] = value;
        api.apply_settings(newSettings).then(() => api.get_settings().then(updateUIFromPython));
    };
    if (inputDpi) {
        inputDpi.addEventListener('change', () => {
            const v = parseInt(inputDpi.value, 10);
            if (Number.isFinite(v) && v > 0) persistSetting('setting_dpi', v);
        });
        inputDpi.addEventListener('blur', () => {
            const v = parseInt(inputDpi.value, 10);
            if (Number.isFinite(v) && v > 0) persistSetting('setting_dpi', v);
        });
    }
    if (inputSens) {
        inputSens.addEventListener('change', () => {
            const v = parseFloat(inputSens.value);
            if (Number.isFinite(v) && v > 0) persistSetting('setting_sens', v);
        });
        inputSens.addEventListener('blur', () => {
            const v = parseFloat(inputSens.value);
            if (Number.isFinite(v) && v > 0) persistSetting('setting_sens', v);
        });
    }

    const loadAgentIcons = (agentType) => {
        api.get_agent_list(agentType).then(agents => {
            agentGridContainer.innerHTML = '';
            agents.forEach(agent => {
                const agentButton = document.createElement('div');
                agentButton.classList.add('agent-button');
                agentButton.innerHTML = `
                    <img src="${agent.image}" alt="${agent.name}">
                    <span>${agent.name}</span>
                `;
                agentButton.addEventListener('click', () => {
                    api.log_message(`Agent selected: ${agent.name}`);
                    selectedAgent = agent.name;
                    selectedAgentNameSpan.textContent = agent.name;
                    openAgentPresetModal(agent.name);
                });
                agentGridContainer.appendChild(agentButton);
            });
        });
    };

    const loadOverlayAgentIcons = (agentType) => {
        if (!overlayAgentGrid) return;
        api.get_agent_list(agentType).then(agents => {
            overlayAgentGrid.innerHTML = '';
            agents.forEach(agent => {
                const agentIconContainer = document.createElement('div');
                agentIconContainer.classList.add('overlay-agent-icon-container');

                const agentIcon = document.createElement('img');
                agentIcon.src = agent.image;
                agentIcon.alt = agent.name;
                agentIcon.classList.add('overlay-agent-icon');
                agentIcon.dataset.agent = agent.name;
                agentIcon.draggable = true;

                agentIcon.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', agent.name);
                    e.dataTransfer.setData('text/uri-list', agent.image);
                });

                const settingsBtn = document.createElement('div');
                settingsBtn.classList.add('settings-agent-btn');
                settingsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.6a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09c0 .63.37 1.2.95 1.46.32.15.68.17 1.01.05A1.65 1.65 0 0 0 16 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.45.45-.58 1.12-.33 1.68.12.33.1.69-.05 1.01A1.65 1.65 0 0 0 20.4 8c.63 0 1.2.37 1.46.95.15.32.17.68.05 1.01-.22.67.07 1.39.62 1.79.55.4.87 1.03.87 1.69s-.32 1.29-.87 1.69a1.65 1.65 0 0 0-.62 1.79z"></path></svg>';
                settingsBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    openAgentPresetSelectorModal(agent.name);
                });

                agentIconContainer.appendChild(agentIcon);
                agentIconContainer.appendChild(settingsBtn);
                overlayAgentGrid.appendChild(agentIconContainer);
            });
        });
    };

    

    const loadPresetsForSelectedAgent = () => {
        if (!selectedAgent) return;
        api.get_presets_for_agent(selectedAgent).then(presets => {
            existingPresetsDropdown.innerHTML = '';
            if (presets.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No presets found';
                existingPresetsDropdown.appendChild(option);
                loadPresetBtn.disabled = true;
                deletePresetBtn.disabled = true;
            } else {
                presets.forEach(preset => {
                    const option = document.createElement('option');
                    option.value = preset;
                    option.textContent = preset;
                    existingPresetsDropdown.appendChild(option);
                });
                loadPresetBtn.disabled = false;
                deletePresetBtn.disabled = false;
            }
        });
    };

    const saveCurrentPreset = () => {
        const presetName = newPresetNameInput.value.trim();
        if (!presetName) {
            showMessage('Please enter a preset name.', 'warning');
            return;
        }
        if (!selectedAgent) {
            showMessage('Please select an agent first.', 'warning');
            return;
        }

        const settingsToSave = {
            primary_recoil_y: primaryRecoilY ? (parseFloat(primaryRecoilY.value) / 100.0) : (primaryRecoilYValue ? parseFloat(primaryRecoilYValue.textContent) : 0),
            primary_recoil_x: primaryRecoilX ? (parseFloat(primaryRecoilX.value) / 1000.0) : (primaryRecoilXValue ? parseFloat(primaryRecoilXValue.textContent) : 0),
            secondary_weapon_enabled: secondaryWeaponEnabled ? secondaryWeaponEnabled.checked : false,
            secondary_recoil_y: secondaryRecoilY ? (parseFloat(secondaryRecoilY.value) / 100.0) : (secondaryRecoilYValue ? parseFloat(secondaryRecoilYValue.textContent) : 0),
            secondary_recoil_x: secondaryRecoilX ? (parseFloat(secondaryRecoilX.value) / 1000.0) : (secondaryRecoilXValue ? parseFloat(secondaryRecoilXValue.textContent) : 0),
        };

        api.save_preset(selectedAgent, presetName, settingsToSave).then(response => {
            if (response.success) {
                showMessage(response.message, 'success');
                newPresetNameInput.value = '';
                loadPresetsForSelectedAgent();
            } else {
                showMessage(response.message, 'error');
            }
        });
    };

    const loadSelectedPreset = () => {
        const presetName = existingPresetsDropdown.value;
        if (!presetName) {
            showMessage('Please select a preset to load.', 'warning');
            return;
        }
        if (!selectedAgent) {
            showMessage('Please select an agent first.', 'warning');
            return;
        }

        api.load_preset(selectedAgent, presetName).then(response => {
            if (response.success) {
                updateUIFromPython(response.settings);
                showMessage(`Preset '${presetName}' loaded successfully!`, 'success');
            } else {
                showMessage(response.message, 'error');
            }
        });
    };

    const deleteSelectedPreset = () => {
        const presetName = existingPresetsDropdown.value;
        if (!presetName) {
            showMessage('Please select a preset to delete.', 'warning');
            return;
        }
        if (!selectedAgent) {
            showMessage('Please select an agent first.', 'warning');
            return;
        }

        if (confirm(`Are you sure you want to delete preset '${presetName}'?`)) {
            api.delete_preset(selectedAgent, presetName).then(response => {
                if (response.success) {
                    showMessage(response.message, 'success');
                    loadPresetsForSelectedAgent();
                } else {
                    showMessage(response.message, 'error');
                }
            });
        }
    };

    const typeMessage = (element, message, onComplete) => {
        element.innerHTML = '';
        let i = 0;
        const typing = () => {
            if (i < message.length) {
                element.textContent += message.charAt(i);
                i++;
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
                setTimeout(typing, Math.random() * 20 + 5);
            } else if (onComplete) {
                onComplete(message);
            }
        };
        typing();
    };

    const addChatMessage = (sender, message, type = 'ai', isTyping = false) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);

        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.textContent = sender.charAt(0).toUpperCase();

        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');

        const timestamp = document.createElement('div');
        timestamp.classList.add('timestamp');
        const now = new Date();
        timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageWrapper.appendChild(messageContent);
        messageWrapper.appendChild(timestamp);

        messageElement.appendChild(avatar);
        messageElement.appendChild(messageWrapper);

        if (isTyping) {
            const thinkingIndicator = document.createElement('div');
            thinkingIndicator.classList.add('dot-flashing');
            messageContent.appendChild(thinkingIndicator);
        } else {
            if (type === 'ai' && message) {
                typeMessage(messageContent, message, () => {
                    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
                });
            } else {
                messageContent.textContent = message;
            }
        }

        chatHistoryDiv.appendChild(messageElement);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        return messageElement;
    };

    const hideWelcomeMessage = () => {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
    };

    let currentAiMessageElement = null;

        window.handleAiStream = (base64Data) => {
    const decodedData = atob(base64Data);
    const messages = decodedData.split('\n\n').filter(Boolean);

    for (const message of messages) {
        const lines = message.split('\n');
        const eventLine = lines.find(l => l.startsWith('event:'));
        const dataLine = lines.find(l => l.startsWith('data:'));

        if (eventLine && dataLine) {
            const eventType = eventLine.substring(6).trim();
            const dataStr = dataLine.substring(5).trim();
            
            try {
                const data = JSON.parse(dataStr);

                if (eventType === 'error') {
                    showChatError(data.message);
                    return; 
                }

                if (!currentAiMessageElement) continue;

                const messageContent = currentAiMessageElement.querySelector('.message-content');
                
                if (eventType === 'thought_step') {
                    let reasoningList = messageContent.querySelector('.reasoning-list');
                    if (!reasoningList) {
                        messageContent.innerHTML = `
                            <div class="thinking-process-container">
                                <div class="thinking-process-header">
                                    <h4 class="thinking-process-title">Reasoning</h4>
                                    <svg class="toggle-svg collapsed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                                <div class="thinking-process-content" style="display: none;">
                                    <ul class="reasoning-list"></ul>
                                    <hr style="border-color: #444; margin-top: 15px; margin-bottom: 15px;">
                                </div>
                            </div>
                            <div class="final-response"></div>`;
                        
                        reasoningList = messageContent.querySelector('.reasoning-list');
                        
                        const header = messageContent.querySelector('.thinking-process-header');
                        const content = messageContent.querySelector('.thinking-process-content');
                        const arrow = messageContent.querySelector('.toggle-svg');

                        header.addEventListener('click', () => {
                            const isCollapsed = content.style.display === 'none';
                            content.style.display = isCollapsed ? 'block' : 'none';
                            arrow.classList.toggle('collapsed', !isCollapsed);
                        });
                    }
                    
                    const stepElement = document.createElement('li');
                    stepElement.classList.add('reasoning-item');
                    stepElement.textContent = data.content || 'Processing...';
                    reasoningList.appendChild(stepElement);

                } else if (eventType === 'result') {
                    let finalResponseContainer = messageContent.querySelector('.final-response');
                    
                    if (!finalResponseContainer) {
                        finalResponseContainer = messageContent;
                        messageContent.innerHTML = '';
                    }

                    typeMessage(finalResponseContainer, data.response_text, (fullText) => {
                        finalResponseContainer.innerHTML = marked.parse(fullText);
                        
                        if (data.new_settings) {
                            api.apply_settings(data.new_settings).then(() => {
                                api.get_settings().then(updateUIFromPython);
                            });
                        }
                        if (data.ui_actions) {
                            data.ui_actions.forEach(action => {
                                api.handle_ui_action(action);
                            });
                        }

                        chatHistoryList.push({ role: 'assistant', content: data.response_text });
                        currentAiMessageElement = null;
                        chatInput.disabled = false;
                        sendChatBtn.disabled = false;
                        chatInput.focus();
                        if (typeof data.mpd_recoil_ai_remaining !== 'undefined' && typeof data.mpd_thinking_remaining !== 'undefined') {
                            updateMpdCache(data.mpd_recoil_ai_remaining, data.mpd_thinking_remaining);
                            const selectedModel = document.getElementById('ai-model-select-value').value;
                            updateMpdDisplay(selectedModel);
                        }
                    });
                }
            } catch (e) {
                console.error('Error parsing stream data:', e, dataStr);
                showChatError('Failed to parse response from AI.');
            }
        }
    }
};

    const showChatError = (message) => {
        if (currentAiMessageElement) {
            currentAiMessageElement.remove();
            currentAiMessageElement = null;
        }
        let displayMessage = message;
        
        if (typeof message === 'string') {
            if (message.includes('429')) {
                displayMessage = 'Você atingiu o limite de mensagens para este modelo.';
            } else if (message.includes('400')) {
                displayMessage = 'Ocorreu um erro com o seu pedido. Verifique os dados e tente novamente.';
            } else if (message.includes('404')) {
                displayMessage = 'O serviço de IA não foi encontrado. Por favor, tente mais tarde.';
            } else if (message.includes('405')) {
                displayMessage = 'Ocorreu um erro de método no servidor. Por favor, tente mais tarde.';
            } else if (message.includes('500')) {
                displayMessage = 'Ocorreu um erro interno no servidor de IA. Por favor, tente mais tarde.';
            }
        }

        addChatMessage('Error', displayMessage, 'error');
        chatInput.disabled = false;
        sendChatBtn.disabled = false;
    };

    window.handleAiStreamError = (errorMessage) => {
        console.error("Stream Error from Python:", errorMessage);
        showChatError(errorMessage);
    };


    const sendChatMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        const selectedModel = document.getElementById('ai-model-select-value').value;

        hideWelcomeMessage();
        addChatMessage('You', message, 'user');
        chatInput.value = '';
        chatInput.disabled = true;
        sendChatBtn.disabled = true;

        currentAiMessageElement = addChatMessage('AI', '', 'ai', true);

        chatHistoryList.push({ role: 'user', content: message });

        let settings = await api.get_settings();
        let discordUserId = settings.discord_user_id;

        if (!discordUserId) {
            const authenticated = await showPinModal();
            if (!authenticated) {
                if(currentAiMessageElement) currentAiMessageElement.remove();
                currentAiMessageElement = null;
                addChatMessage('AI', 'Authentication required to use the AI assistant.', 'ai');
                chatInput.disabled = false;
                sendChatBtn.disabled = false;
                return;
            }
            settings = await api.get_settings();
            discordUserId = settings.discord_user_id;
        }

        try {
            const response = await api.send_ai_message(message, chatHistoryList, discordUserId, selectedModel);
            if (response.streaming) {
            } else {
                if(currentAiMessageElement) currentAiMessageElement.remove();
                currentAiMessageElement = null;
                if (response.success) {
                    const aiResponse = response.data;
                    const newAiMessage = addChatMessage('AI', '', 'ai');
                    const messageContent = newAiMessage.querySelector('.message-content');
                    typeMessage(messageContent, aiResponse.response_text, (fullText) => {
                        messageContent.innerHTML = marked.parse(fullText);
                        chatHistoryList.push({ role: 'assistant', content: aiResponse.response_text });
                        if (aiResponse.new_settings) {
                            api.apply_settings(aiResponse.new_settings).then(() => {
                                api.get_settings().then(updateUIFromPython);
                            });
                        }
                        if (aiResponse.ui_actions) {
                            aiResponse.ui_actions.forEach(action => {
                                api.handle_ui_action(action);
                            });
                        }
                        if (typeof aiResponse.mpd_recoil_ai_remaining !== 'undefined' && typeof aiResponse.mpd_thinking_remaining !== 'undefined') {
                            updateMpdCache(aiResponse.mpd_recoil_ai_remaining, aiResponse.mpd_thinking_remaining);
                            const selectedModel = document.getElementById('ai-model-select-value').value;
                            updateMpdDisplay(selectedModel);
                        }
                    });
                } else {
                    showChatError(response.message);
                }
                chatInput.disabled = false;
                sendChatBtn.disabled = false;
            }
        } catch (error) {
            showChatError(error.message);
        }
    };

    window.showUpdatePrompt = (latestVersion, currentVersion) => {
        const confirmUpdate = confirm(`A new version (${latestVersion}) is available! Your current version is (${currentVersion}).\nDo you want to download now?`);
        if (confirmUpdate) {
            api.download_update(latestVersion).then(response => {
                if (response.success) {
                    showMessage(response.message, 'info');
                    const restartConfirm = confirm("Update downloaded. Do you want to restart the application now?");
                    if (restartConfirm) {
                        api.restart_application(response.download_path);
                    }
                } else {
                    showMessage(response.message, 'error');
                }
            });
        }
    };

    toggleButton.addEventListener('click', () => {
        api.toggle_recoil().then(response => {
            updateToggleButtonState(response.isActive);
        });
    });

    const toggleOverlayBtn = document.getElementById('toggle-overlay-btn');
    if (toggleOverlayBtn) {
        toggleOverlayBtn.addEventListener('click', () => {
            api.toggle_overlay().then(response => {
                updateOverlayButtonState(response.isActive);
                if (response.isActive) {
                    setTimeout(() => {
                        send_agents_to_overlay();
                    }, 500);
                }
            });
        });
    }

    if (primaryWeaponBtn) primaryWeaponBtn.addEventListener('click', () => switchWeaponView('primary'));
    if (secondaryWeaponBtn) secondaryWeaponBtn.addEventListener('click', () => switchWeaponView('secondary'));
    if (navRecoilPrimaryBtn) navRecoilPrimaryBtn.addEventListener('click', () => switchWeaponView('primary'));
    if (navRecoilSecondaryBtn) navRecoilSecondaryBtn.addEventListener('click', () => switchWeaponView('secondary'));
    if (miniPrimaryBtn) miniPrimaryBtn.addEventListener('click', () => switchWeaponView('primary'));
    if (miniSecondaryBtn) miniSecondaryBtn.addEventListener('click', () => switchWeaponView('secondary'));

    const weaponTabs = document.getElementById('weapon-tabs');
    const weaponPanelsInner = document.getElementById('weapon-panels-inner');
    if (weaponTabPrimaryBtn) weaponTabPrimaryBtn.addEventListener('click', () => {
        if (weaponTabs) weaponTabs.classList.remove('right-active');
        if (weaponPanelsInner) weaponPanelsInner.classList.remove('show-secondary');
        switchWeaponView('primary');
    });
    if (weaponTabSecondaryBtn) weaponTabSecondaryBtn.addEventListener('click', () => {
        if (weaponTabs) weaponTabs.classList.add('right-active');
        if (weaponPanelsInner) weaponPanelsInner.classList.add('show-secondary');
        switchWeaponView('secondary');
    });

    const setupSync = (slider, label, multiplier, decimals) => {
        slider.addEventListener('input', () => {
            if (label) label.textContent = (slider.value / multiplier).toFixed(decimals);
            handleSettingChange();
        });
        if (label) label.textContent = (slider.value / multiplier).toFixed(decimals);
    };

    const enableEditableValue = (label, slider, multiplier, decimals) => {
        if (!label || !slider) return;
        const activateEditor = () => {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 1 / multiplier;
            input.className = 'value-input';
            const current = parseFloat(label.textContent.replace(',', '.'));
            input.value = Number.isFinite(current) ? current.toFixed(decimals) : (parseFloat(slider.value) / multiplier).toFixed(decimals);
            input.style.width = Math.max(60, label.offsetWidth + 14) + 'px';

            let finished = false;
            const commit = () => {
                if (finished) return;
                finished = true;
                let v = parseFloat((input.value || '').toString().replace(',', '.'));
                if (!Number.isFinite(v)) { cancel(); return; }
                const min = (parseFloat(slider.min) || 0) / multiplier;
                const max = (parseFloat(slider.max) || 0) / multiplier;
                if (min < max) v = Math.min(Math.max(v, min), max); else v = Math.min(Math.max(v, max), min);
                
                const sliderValue = Math.round(v * multiplier);
                slider.value = sliderValue.toString();
                
                const actualValue = sliderValue / multiplier;
                label.textContent = actualValue.toFixed(decimals);

                if (input.parentNode) input.replaceWith(label);
                handleSettingChange();
            };

            const cancel = () => {
                if (finished) return;
                finished = true;
                if (input.parentNode) input.replaceWith(label);
            };

            input.addEventListener('blur', commit);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') cancel();
            });

            if (label.parentNode) label.replaceWith(input);
            setTimeout(() => {
                input.focus();
                input.select();
            }, 0);
        };

        label.classList.add('value-editable');
        label.title = 'Click to edit';
        label.addEventListener('click', activateEditor);
    };

    if (primaryRecoilY) {
        const syncPrimaryY = () => {
            const pry = parseFloat(primaryRecoilY.value) / 100.0;
            if (primaryRecoilYValue) primaryRecoilYValue.textContent = pry.toFixed(3);
            handleSettingChange();
        };
        primaryRecoilY.addEventListener('input', syncPrimaryY);
        primaryRecoilY.addEventListener('change', syncPrimaryY);
        syncPrimaryY();
        enableEditableValue(primaryRecoilYValue, primaryRecoilY, 100, 3);
    }
    if (primaryRecoilX && primaryRecoilXValue) {
        setupSync(primaryRecoilX, primaryRecoilXValue, 1000, 3);
        enableEditableValue(primaryRecoilXValue, primaryRecoilX, 1000, 3);
    }
    if (secondaryRecoilY) {
        const syncSecondaryY = () => {
            const sry = parseFloat(secondaryRecoilY.value) / 100.0;
            if (secondaryRecoilYValue) secondaryRecoilYValue.textContent = sry.toFixed(3);
            handleSettingChange();
        };
        secondaryRecoilY.addEventListener('input', syncSecondaryY);
        secondaryRecoilY.addEventListener('change', syncSecondaryY);
        syncSecondaryY();
        enableEditableValue(secondaryRecoilYValue, secondaryRecoilY, 100, 3);
    }
    if (secondaryRecoilX && secondaryRecoilXValue) {
        setupSync(secondaryRecoilX, secondaryRecoilXValue, 1000, 3);
        enableEditableValue(secondaryRecoilXValue, secondaryRecoilX, 1000, 3);
    }
    
    if (tbagEnabled) tbagEnabled.addEventListener('change', handleSettingChange);
    
    if (doNotShowAboutAgainCheckbox) doNotShowAboutAgainCheckbox.addEventListener('change', handleSettingChange);
    
    if (macroAutoClick) macroAutoClick.addEventListener('change', handleSettingChange);
    if (overlayEnabled) overlayEnabled.addEventListener('change', handleSettingChange);
    if (overlayZoomLevel) {
        setupSync(overlayZoomLevel, overlayZoomLevelValue, 100, 1);
        enableEditableValue(overlayZoomLevelValue, overlayZoomLevel, 100, 1);
    }

    if (navRecoilBtn) navRecoilBtn.addEventListener('click', () => {
        showTab('recoil');
        if (recoilNavGroup) recoilNavGroup.classList.toggle('open');
    });
    if (navPresetsBtn) navPresetsBtn.addEventListener('click', () => showTab('presets'));
    if (navMacrosBtn) navMacrosBtn.addEventListener('click', () => showTab('macros'));
    if (navOverlayBtn) navOverlayBtn.addEventListener('click', () => showTab('overlay'));
    if (navAiBtn) navAiBtn.addEventListener('click', () => showTab('ai-chat'));
    if (navAboutBtn) navAboutBtn.addEventListener('click', () => showTab('about'));
    if (navSettingsBtn) navSettingsBtn.addEventListener('click', () => showTab('settings'));

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            if (appLayout) appLayout.classList.toggle('collapsed');
            const icon = sidebarToggle.querySelector('.icon-chev');
            if (icon) {
                if (sidebar.classList.contains('collapsed')) {
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    }

    if (btnMin) btnMin.addEventListener('click', () => api.minimize());
    if (btnMax) btnMax.addEventListener('click', () => api.toggle_maximize());
    if (btnClose) btnClose.addEventListener('click', () => api.close_window());

    if (tabAttackers) tabAttackers.addEventListener('click', () => {
        tabAttackers.classList.add('active');
        tabDefenders.classList.remove('active');
        if (tabSavedPresets) tabSavedPresets.classList.remove('active');
        tabCommunity.classList.remove('active');
        if (presetsTabs) {
            presetsTabs.classList.remove('pos-2', 'pos-3', 'pos-4');
        }
        loadAgentIcons('attackers');
        if (agentGridContainer) agentGridContainer.style.display = '';
        if (presetManagementSection) presetManagementSection.style.display = 'none';
        if (communitySection) communitySection.style.display = 'none';
    });
    if (tabDefenders) tabDefenders.addEventListener('click', () => {
        tabDefenders.classList.add('active');
        tabAttackers.classList.remove('active');
        if (tabSavedPresets) tabSavedPresets.classList.remove('active');
        tabCommunity.classList.remove('active');
        if (presetsTabs) {
            presetsTabs.classList.add('pos-2');
            presetsTabs.classList.remove('pos-3', 'pos-4');
        }
        loadAgentIcons('defenders');
        if (agentGridContainer) agentGridContainer.style.display = '';
        if (presetManagementSection) presetManagementSection.style.display = 'none';
        if (communitySection) communitySection.style.display = 'none';
    });
    if (tabSavedPresets) tabSavedPresets.addEventListener('click', () => {
        tabSavedPresets.classList.add('active');
        tabAttackers.classList.remove('active');
        tabDefenders.classList.remove('active');
        tabCommunity.classList.remove('active');
        if (presetsTabs) {
            presetsTabs.classList.remove('pos-2', 'pos-4');
            presetsTabs.classList.add('pos-3');
        }
        loadAgentIcons('saved');
        if (agentGridContainer) agentGridContainer.style.display = '';
        if (presetManagementSection) presetManagementSection.style.display = 'none';
        if (communitySection) communitySection.style.display = 'none';
    });
    if (tabCommunity) tabCommunity.addEventListener('click', () => {
        tabCommunity.classList.add('active');
        tabAttackers.classList.remove('active');
        tabDefenders.classList.remove('active');
        if (tabSavedPresets) tabSavedPresets.classList.remove('active');
        if (presetsTabs) {
            presetsTabs.classList.remove('pos-2', 'pos-3');
            presetsTabs.classList.add('pos-4');
        }
        if (agentGridContainer) agentGridContainer.style.display = 'none';
        if (presetManagementSection) presetManagementSection.style.display = 'none';
        if (communitySection) communitySection.style.display = '';
        loadCommunityPresets();
    });

    if (overlayTabAttackers) overlayTabAttackers.addEventListener('click', () => {
        overlayTabAttackers.classList.add('active');
        overlayTabDefenders.classList.remove('active');
        if (overlayTabs) {
            overlayTabs.classList.remove('right-active');
        }
        loadOverlayAgentIcons('attackers');
    });
    if (overlayTabDefenders) overlayTabDefenders.addEventListener('click', () => {
        overlayTabDefenders.classList.add('active');
        overlayTabAttackers.classList.remove('active');
        if (overlayTabs) {
            overlayTabs.classList.add('right-active');
        }
        loadOverlayAgentIcons('defenders');
    });

    

    const renderCommunityPresets = (presets) => {
        if (!communityGrid) return;
        communityGrid.innerHTML = '';
        if (!presets || presets.length === 0) {
            communityGrid.innerHTML = `
                <div class="empty-community">
                    <h3>No community presets found</h3>
                    <p>Be the first to publish one using the button on the left.</p>
                </div>
            `;
            return;
        }
        presets.forEach(p => {
            console.log('community preset item:', p);
            const card = document.createElement('div');
            card.className = 'community-card';
            const name = (p.name || 'Unnamed');
            const agent = (p.agent || 'Agent');
            const author = (p.author || 'anonymous');
            const downloads = (p.downloads != null ? p.downloads : 0);
            const rating = (p.rating != null ? p.rating : 0);
            const normalized = (agent || '').toLowerCase().replace(/\s+/g,'');
            const attackerPath = `Agents/attackers/${normalized}.png`;
            const defenderPath = `Agents/defenders/${normalized}.png`;
            const opIcon = `<img class="op-icon" src="${attackerPath}" onerror="this.onerror=null;this.src='${defenderPath}';" alt="${agent}">`;
            const s = p.settings || {};
            const dpi = s.dpi ?? s.mouse_dpi ?? '—';
            const sens = s.sens ?? s.sensitivity ?? s.setting_sens ?? '—';
            const hr = (s.primary_recoil_x ?? s.recoil_x ?? s.horizontal_recoil ?? '—');
            const vr = (s.primary_recoil_y ?? s.recoil_y ?? s.vertical_recoil ?? '—');
            const fmt = (v, d=3) => {
                if (v === null || typeof v === 'undefined' || v === '') return '—';
                const n = Number(v);
                return Number.isFinite(n) ? n.toFixed(d) : String(v);
            };
            card.innerHTML = `
                <div class="card-header">${opIcon}<h4>${name}</h4></div>
                <div class="meta">${agent} • by ${author}</div>
                <div class="specs">
                    <span class="spec">DPI: ${dpi}</span>
                    <span class="spec">Sens: ${sens}</span>
                    <span class="spec">H: ${fmt(hr)}</span>
                    <span class="spec">V: ${fmt(vr)}</span>
                </div>
                <div class="meta">Saves: ${downloads}</div>
                <div class="btn-group">
                    <button class="btn btn-neutral" data-action="load" data-id="${p.id}">Load Preset</button>
                    <button class="btn btn-neutral" data-action="save" data-id="${p.id}">Save Preset</button>
                </div>
            `;
            card.querySelector('[data-action="load"]').addEventListener('click', () => importCommunityPreset(p.id));
            card.querySelector('[data-action="save"]').addEventListener('click', () => {
                importCommunityPreset(p.id);
                openAgentPresetModal(agent);
            });
            communityGrid.appendChild(card);
        });
    };

    const loadCommunityPresets = (agent = '', query = '') => {
        api.get_community_presets(agent || null, query || null).then(res => {
            renderCommunityPresets(res && res.presets ? res.presets : []);
        }).catch(() => {
            if (communityGrid) communityGrid.innerHTML = '<div style="opacity:.8;">Failed to load community presets.</div>';
        });
    };

    const importCommunityPreset = (presetId) => {
        api.import_community_preset(presetId).then(res => {
            if (res && res.success && res.settings) {
                updateUIFromPython(res.settings);
                if (window.showMessage) window.showMessage('Community preset imported.', 'success');
            } else {
                if (window.showMessage) window.showMessage('Failed to import preset.', 'error');
            }
        });
    };

    const agentPresetModal = document.getElementById('agent-preset-modal');
    const agentPresetCloseBtn = document.getElementById('agent-preset-close');
    const agentPresetNameInput = document.getElementById('agent-preset-name');
    const agentPresetSaveBtn = document.getElementById('agent-preset-save-btn');
    const agentPresetLoadBtn = document.getElementById('agent-preset-load-btn');
    const agentPresetTabs = document.getElementById('agent-preset-tabs');
    const agentPresetTabSave = document.getElementById('agent-preset-tab-save');
    const agentPresetTabLoad = document.getElementById('agent-preset-tab-load');
    const agentPresetPanelSave = document.getElementById('agent-preset-panel-save');
    const agentPresetPanelLoad = document.getElementById('agent-preset-panel-load');
    const agentPresetExistingSelect = document.getElementById('agent-preset-existing');
    const agentPresetDeleteBtn = document.getElementById('agent-preset-delete-btn');
    let agentPresetMode = 'save';

    const openAgentPresetModal = (agentName) => {
        if (!agentPresetModal) return;
        selectedAgent = agentName;
        const operatorSave = document.getElementById('agent-preset-operator-save');
        const operatorLoad = document.getElementById('agent-preset-operator-load');
        if(operatorSave) operatorSave.textContent = agentName;
        if(operatorLoad) operatorLoad.textContent = agentName;

        if (agentPresetNameInput) agentPresetNameInput.value = '';
        
        const host = document.querySelector('.app-layout') || document.body;
        host.appendChild(agentPresetModal);
        agentPresetModal.classList.add('show');
        agentPresetModal.style.display = 'flex';

        if(agentPresetTabSave) agentPresetTabSave.click();
    };
    const closeAgentPresetModal = () => { if (agentPresetModal) { agentPresetModal.classList.remove('show'); agentPresetModal.style.display = 'none'; } };
    if (agentPresetCloseBtn) agentPresetCloseBtn.addEventListener('click', closeAgentPresetModal);

    if (agentPresetTabSave) agentPresetTabSave.addEventListener('click', () => {
        agentPresetMode = 'save';
        agentPresetTabSave.classList.add('active');
        if (agentPresetTabLoad) agentPresetTabLoad.classList.remove('active');
        if (agentPresetTabs) agentPresetTabs.classList.remove('right-active');
        if (agentPresetPanelSave) agentPresetPanelSave.style.display = '';
        if (agentPresetPanelLoad) agentPresetPanelLoad.style.display = 'none';
    });

    if (agentPresetTabLoad) agentPresetTabLoad.addEventListener('click', () => {
        agentPresetMode = 'load';
        agentPresetTabLoad.classList.add('active');
        if (agentPresetTabSave) agentPresetTabSave.classList.remove('active');
        if (agentPresetTabs) agentPresetTabs.classList.add('right-active');
        if (agentPresetPanelSave) agentPresetPanelSave.style.display = 'none';
        if (agentPresetPanelLoad) agentPresetPanelLoad.style.display = '';
        
        agentPresetExistingSelect.innerHTML = '';
        if (selectedAgent) {
            api.get_presets_for_agent(selectedAgent).then(list => {
                if (Array.isArray(list) && list.length > 0) {
                    list.forEach(name => {
                        const opt = document.createElement('option');
                        opt.value = name;
                        opt.textContent = name;
                        agentPresetExistingSelect.appendChild(opt);
                    });
                } else {
                    const opt = document.createElement('option');
                    opt.value = '';
                    opt.textContent = 'No presets found';
                    agentPresetExistingSelect.appendChild(opt);
                }
            });
        }
    });

    if (agentPresetSaveBtn) agentPresetSaveBtn.addEventListener('click', () => {
        const name = (agentPresetNameInput?.value || '').trim();
        if (!selectedAgent || !name) {
            if (window.showMessage) window.showMessage('Enter a preset name.', 'error');
            return;
        }
        
        const s_primary_recoil_y = primaryRecoilY ? (parseFloat(primaryRecoilY.value) / 100.0) : (primaryRecoilYValue ? parseFloat(primaryRecoilYValue.textContent) : 0);
        const s_primary_recoil_x = primaryRecoilX ? (parseFloat(primaryRecoilX.value) / 1000.0) : (primaryRecoilXValue ? parseFloat(primaryRecoilXValue.textContent) : 0);
        const s_secondary_recoil_y = secondaryRecoilY ? (parseFloat(secondaryRecoilY.value) / 100.0) : (secondaryRecoilYValue ? parseFloat(secondaryRecoilYValue.textContent) : 0);
        const s_secondary_recoil_x = secondaryRecoilX ? (parseFloat(secondaryRecoilX.value) / 1000.0) : (secondaryRecoilXValue ? parseFloat(secondaryRecoilXValue.textContent) : 0);
        const s_secondary_weapon_enabled = secondaryWeaponEnabled ? !!secondaryWeaponEnabled.checked : false;

        const settingsToSave = {
            primary_recoil_y: s_primary_recoil_y,
            primary_recoil_x: s_primary_recoil_x,
            secondary_recoil_y: s_secondary_recoil_y,
            secondary_recoil_x: s_secondary_recoil_x,
        };
        
        if (s_secondary_weapon_enabled) settingsToSave.secondary_weapon_enabled = true;
        api.save_preset(selectedAgent, name, settingsToSave).then(r => {
            if (r && r.success) {
                if (window.showMessage) window.showMessage('Preset saved.', 'success');
                closeAgentPresetModal();
                showRatingPopupIfNeeded();
            } else {
                if (window.showMessage) window.showMessage('Failed to save preset.', 'error');
            }
        });
    });
    if (agentPresetLoadBtn) agentPresetLoadBtn.addEventListener('click', () => {
        const name = (agentPresetExistingSelect?.value || '').trim();
        if (!selectedAgent || !name) {
            if (window.showMessage) window.showMessage('Enter a preset name to load.', 'error');
            return;
        }
        api.load_preset(selectedAgent, name).then(res => {
            if (res && res.success && res.settings) {
                updateUIFromPython(res.settings);
                if (window.showMessage) window.showMessage('Preset loaded.', 'success');
                closeAgentPresetModal();
            } else {
                if (window.showMessage) window.showMessage(res && res.message ? res.message : 'Preset not found.', 'error');
            }
        });
    });

    if (agentPresetDeleteBtn) agentPresetDeleteBtn.addEventListener('click', () => {
        const name = (agentPresetExistingSelect?.value || '').trim();
        if (!selectedAgent || !name) {
            if (window.showMessage) window.showMessage('Select a preset to delete.', 'error');
            return;
        }
        api.delete_preset(selectedAgent, name).then(r => {
            if (r && r.success) {
                if (window.showMessage) window.showMessage('Preset deleted.', 'success');
                
                agentPresetTabLoad.click();
            } else {
                if (window.showMessage) window.showMessage(r && r.message ? r.message : 'Failed to delete preset.', 'error');
            }
        });
    });

    if (communitySearch) communitySearch.addEventListener('input', () => {
        const q = communitySearch.value || '';
        const agent = communityAgentFilter ? communityAgentFilter.value : '';
        loadCommunityPresets(agent, q);
    });
    if (communityAgentFilter) communityAgentFilter.addEventListener('change', () => {
        const q = communitySearch ? communitySearch.value : '';
        const agent = communityAgentFilter.value || '';
        loadCommunityPresets(agent, q);
    });

    const publishCloseBtn = document.getElementById('publish-close');

    const openPublishModal = () => {
        if (!publishModal) return;
        publishPresetSelect.innerHTML = '';
        const selectedAgent = (document.getElementById('selected-agent-name')?.textContent || '').trim();
        const addOptions = (agentType) => {
            const agents = agentType === 'attackers' ? ['attackers'] : ['defenders'];
        };
        api.get_all_local_presets().then(list => {
            publishPresetSelect.innerHTML = '';
            if (Array.isArray(list) && list.length > 0) {
                list.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = `${item.agent}/${item.name}`;
                    opt.textContent = `${item.agent} / ${item.name}`;
                    publishPresetSelect.appendChild(opt);
                });
            } else {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = 'No saved presets found';
                publishPresetSelect.appendChild(opt);
            }
        }).catch(() => {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Failed to load saved presets';
            publishPresetSelect.appendChild(opt);
        });
        publishNameInput.value = '';
        const host = document.querySelector('.app-layout') || document.body;
        host.appendChild(publishModal);
        publishModal.classList.add('show');
        publishModal.style.display = 'flex';
    };

    const closePublishModal = () => { if (publishModal) { publishModal.classList.remove('show'); publishModal.style.display = 'none'; } };

    if (publishBtn) publishBtn.addEventListener('click', openPublishModal);
    if (publishCancelBtn) publishCancelBtn.addEventListener('click', closePublishModal);
    if (publishCloseBtn) publishCloseBtn.addEventListener('click', closePublishModal);
    if (publishConfirmBtn) publishConfirmBtn.addEventListener('click', () => {
        const selected = publishPresetSelect.value;
        const communityName = (publishNameInput.value || '').trim();
        let currentAgent = document.getElementById('selected-agent-name')?.textContent || '';
        let selectedAgentFromValue = null;
        let selectedPresetName = null;
        if (selected) {
            const parts = selected.split('/').map(s => s.trim()).filter(Boolean);
            if (parts.length === 2) {
                selectedAgentFromValue = parts[0];
                selectedPresetName = parts[1];
            } else {
                selectedPresetName = selected;
            }
        }
        if (!currentAgent && selectedAgentFromValue) currentAgent = selectedAgentFromValue;
        const errorBox = document.getElementById('publish-error');
        const setError = (msg) => {
            if (!errorBox) return;
            errorBox.textContent = msg;
            errorBox.style.display = msg ? 'block' : 'none';
        };
        setError('');
        if (!selected || !communityName || !currentAgent) {
            setError('Select a preset, pick an agent, and enter a name.');
            return;
        }
        const dpiVal = currentSettings.setting_dpi ?? currentSettings.dpi ?? currentSettings.mouse_dpi;
        const sensVal = currentSettings.setting_sens ?? currentSettings.sens ?? currentSettings.sensitivity;
        const dpiNum = parseFloat(dpiVal);
        const sensNum = parseFloat(sensVal);
        if (!Number.isFinite(dpiNum) || dpiNum <= 0 || !Number.isFinite(sensNum) || sensNum <= 0) {
            setError('Set DPI and Sensitivity in Settings before publishing.');
            return;
        }
        const presetToLoad = selectedPresetName || selected;
        api.load_preset(currentAgent, presetToLoad).then(res => {
            console.log('Loaded preset for publish:', res);
            if (!res || !res.success || !res.settings) {
                setError('Failed to load preset content.');
                return;
            }
            const settings = res.settings;
            const payload = {
                agent: currentAgent,
                name: communityName,
                settings: {
                    primary_recoil_y: settings.primary_recoil_y,
                    primary_recoil_x: settings.primary_recoil_x,
                    secondary_recoil_y: settings.secondary_recoil_y,
                    secondary_recoil_x: settings.secondary_recoil_x,
                    secondary_weapon_enabled: settings.secondary_weapon_enabled,
                    dpi: dpiNum,
                    sens: sensNum
                },
                author: settings.discord_user_id || null
            };
            console.log('Publishing payload:', payload);
            window.pywebview.api.log_message('Publishing community preset...');
            window.pywebview.api.log_message(JSON.stringify(payload));
            pywebview.api.post_community_preset(payload).then(r => {
                if (r && r.success) {
                    closePublishModal();
                    if (window.showMessage) window.showMessage('Preset published!', 'success');
                    loadCommunityPresets();
                } else {
                    setError((r && r.message) ? r.message : 'Failed to publish preset.');
                }
            });
        });
    });

    if (savePresetBtn) savePresetBtn.addEventListener('click', saveCurrentPreset);
    if (loadPresetBtn) loadPresetBtn.addEventListener('click', loadSelectedPreset);
    if (deletePresetBtn) deletePresetBtn.addEventListener('click', deleteSelectedPreset);

    if (sendChatBtn) sendChatBtn.addEventListener('click', sendChatMessage);
    if (chatInput) chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    if (closeAboutModalBtn) closeAboutModalBtn.addEventListener('click', () => {
        if (aboutModal) aboutModal.style.display = 'none';
        if (navAboutBtn) navAboutBtn.classList.remove('active');
    });

    api.get_settings().then(settings => {
        updateUIFromPython(settings);
        setLanguage(settings.language || 'en');
        api.is_recoil_active().then(updateToggleButtonState);
        api.is_overlay_active().then(updateOverlayButtonState);
        loadAgentIcons('attackers');
        const attackersBtnEl = document.getElementById('attackers-btn');
        const defendersBtnEl = document.getElementById('defenders-btn');
        if (attackersBtnEl) attackersBtnEl.classList.add('active');
        if (defendersBtnEl) defendersBtnEl.classList.remove('active');
        if (presetManagementSection) presetManagementSection.style.display = 'none';
        loadCommunityPresets();
    });
    showTab('recoil');
    
    const setupDropZone = (zone) => {
        if (!zone) return;
        const dropSquares = zone.querySelectorAll('.drop-square');
        dropSquares.forEach(square => {
            square.addEventListener('dragover', (e) => {
                e.preventDefault();
                square.classList.add('drag-over');
            });

            square.addEventListener('dragenter', (e) => {
                e.preventDefault();
                square.classList.add('drag-over');
            });

            square.addEventListener('dragleave', () => {
                square.classList.remove('drag-over');
            });

            square.addEventListener('drop', (e) => {
                e.preventDefault();
                square.classList.remove('drag-over');
                const agentName = e.dataTransfer.getData('text/plain');
                const agentImage = e.dataTransfer.getData('text/uri-list');
                
                if (square.firstChild) {
                    return;
                }

                const agentIcon = document.createElement('img');
                agentIcon.src = agentImage;
                agentIcon.alt = agentName;
                agentIcon.classList.add('overlay-agent-icon');
                agentIcon.dataset.agent = agentName;
                square.appendChild(agentIcon);

                const removeBtn = document.createElement('div');
                removeBtn.classList.add('remove-agent-btn');
                removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="12px" height="12px"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
                removeBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    square.innerHTML = '';
                    send_agents_to_overlay();
                });
                square.appendChild(removeBtn);
                send_agents_to_overlay();
            });
        });
    };

    const openAgentPresetSelectorModal = (agentName) => {
        const modal = document.getElementById('agent-preset-selector-modal');
        const agentNameSpan = document.getElementById('selected-agent-preset-agent-name');
        const dropdown = document.getElementById('agent-preset-selector-dropdown');
        const loadBtn = document.getElementById('agent-preset-selector-load-btn');
        const closeBtn = document.getElementById('agent-preset-selector-close');

        agentNameSpan.textContent = agentName;
        dropdown.innerHTML = '';

        api.get_presets_for_agent(agentName).then(presets => {
            if (presets.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No presets found';
                dropdown.appendChild(option);
                loadBtn.disabled = true;
            } else {
                presets.forEach(preset => {
                    const option = document.createElement('option');
                    option.value = preset;
                    option.textContent = preset;
                    dropdown.appendChild(option);
                });
                loadBtn.disabled = false;
            }
        });

        loadBtn.onclick = () => {
            const selectedPreset = dropdown.value;
            if (selectedPreset) {
                api.load_preset(agentName, selectedPreset).then(response => {
                    if (response.success) {
                        updateUIFromPython(response.settings);
                        showMessage(`Preset '${selectedPreset}' for agent '${agentName}' loaded successfully!`, 'success');
                        modal.style.display = 'none';
                    } else {
                        showMessage(response.message, 'error');
                    }
                });
            }
        };

        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        modal.style.display = 'flex';
    };

    const send_agents_to_overlay = () => {
        const dropZone = document.getElementById('agent-drop-zone');
        if (!dropZone) return;

        const agents = [];
        const dropSquares = dropZone.querySelectorAll('.drop-square');
        dropSquares.forEach(square => {
            const agentIcon = square.querySelector('.overlay-agent-icon');
            if (agentIcon) {
                agents.push({
                    name: agentIcon.alt,
                    image: agentIcon.src
                });
            } else {
                agents.push(null);
            }
        });

        api.update_overlay_agents(agents);
    };

    setupDropZone(document.getElementById('agent-drop-zone'));

    let currentRating = 0;

    const createRatingIcons = () => {
        if (!rateAppIconsContainer) return;
        rateAppIconsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const iconWrapper = document.createElement('div');
            iconWrapper.innerHTML = `
                <svg class="rating-icon" data-value="${i}" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            `;
            rateAppIconsContainer.appendChild(iconWrapper.firstElementChild);
        }
    };

    const highlightIcons = (value) => {
        const icons = rateAppIconsContainer.querySelectorAll('.rating-icon');
        icons.forEach(icon => {
            icon.classList.remove('hover');
            if (value > 0 && icon.dataset.value <= value) {
                icon.classList.add('hover');
            }
        });
    };
    
    const setRating = (value) => {
        currentRating = value;
        const icons = rateAppIconsContainer.querySelectorAll('.rating-icon');
        icons.forEach(icon => {
            icon.classList.toggle('active', icon.dataset.value <= currentRating);
        });
        if (rateAppSubmitBtn) {
            rateAppSubmitBtn.disabled = (currentRating === 0 && !rateAppDontShowCheckbox.checked);
        }
    };

    const handlePopupClose = (isSubmit = false) => {
        if (isSubmit || (rateAppDontShowCheckbox && rateAppDontShowCheckbox.checked)) {
            api.apply_settings({ 'rating_feedback_given': true });
            if (rateAppDontShowCheckbox.checked) {
                 showMessage('Preference saved. We won\'t ask you to rate the app again.', 'info');
            }
        }

        if (rateAppModal) {
            rateAppModal.style.display = 'none';
        }
    };

    const showRatingPopupIfNeeded = async () => {
        try {
            const settings = await api.get_settings();
            if (settings.rating_feedback_given !== true) {
                if (rateAppModal) {
                    createRatingIcons();
                    setRating(0);
                    if (rateAppDontShowCheckbox) rateAppDontShowCheckbox.checked = false;
                    if (rateAppSubmitBtn) rateAppSubmitBtn.disabled = true;
                    rateAppModal.style.display = 'flex';
                }
            }
        } catch (e) {
            console.error("Could not check settings for rating popup:", e);
        }
    };

    if (rateAppIconsContainer) {
        rateAppIconsContainer.addEventListener('mouseover', e => {
            const icon = e.target.closest('.rating-icon');
            if (icon) highlightIcons(icon.dataset.value);
        });
        rateAppIconsContainer.addEventListener('mouseleave', () => highlightIcons(0));
        rateAppIconsContainer.addEventListener('click', e => {
            const icon = e.target.closest('.rating-icon');
            if (icon) setRating(icon.dataset.value);
        });
    }

    if (rateAppDontShowCheckbox) {
        rateAppDontShowCheckbox.addEventListener('change', () => {
            if (rateAppSubmitBtn) {
                rateAppSubmitBtn.disabled = (currentRating === 0 && !rateAppDontShowCheckbox.checked);
            }
        });
    }

    if (showRatePopupBtn) {
        showRatePopupBtn.addEventListener('click', () => showRatingPopupIfNeeded());
    }

    if (rateAppModalClose) {
        rateAppModalClose.addEventListener('click', () => handlePopupClose(false));
    }

    if (rateAppSubmitBtn) {
        rateAppSubmitBtn.addEventListener('click', () => {
            if (currentRating > 0) {
                api.send_rating(currentRating);
            } else if (rateAppDontShowCheckbox.checked) {
            }
            handlePopupClose(true);
        });
    }

    if (howToAuthLink) {
        howToAuthLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (howToAuthModal) {
                howToAuthModal.style.display = 'flex';
            }
        });
    }

    if (howToAuthCloseBtn) {
        howToAuthCloseBtn.addEventListener('click', () => {
            if (howToAuthModal) {
                howToAuthModal.style.display = 'none';
            }
        });
    }
});
