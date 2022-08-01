from tethys_sdk.base import TethysAppBase, url_map_maker
from tethys_sdk.app_settings import CustomSetting
from tethys_sdk.permissions import Permission, PermissionGroup


class AppStore(TethysAppBase):
    """
    Tethys app class for App Store.
    """

    name = 'Tethys App Store'
    index = 'home'
    icon = 'app_store/images/appicon.png'
    package = 'app_store'
    root_url = 'app-store'
    color = '#2b7ac0'
    description = 'The Tethys App Store enables you to discover, install, manage and configure Tethys Applications for your Tethys portal.'
    tags = 'Tethys,AppStore,Conda,Github'
    enable_feedback = True
    feedback_emails = ["rohitkh@byu.edu"]
    
    controller_modules = ['controllers', 'notifications', 'git_install_handlers', 'scaffold_handler', ]

    # def url_maps(self):
    #     """
    #     Add controllers
    #     """
    #     UrlMap = url_map_maker(self.root_url)

    #     url_maps = (
    #         # UrlMap(
    #         #     name='home',
    #         #     url='app-store',
    #         #     controller='app_store.controllers.home'
    #         # ),
    #         # UrlMap(
    #         #     name='get_resources',
    #         #     url='app-store/get_resources',
    #         #     controller='app_store.controllers.get_resources'
    #         # ),
    #         # UrlMap(
    #         #     name='install_notifications',
    #         #     url='app-store/install/notifications',
    #         #     controller='app_store.controllers.notificationsConsumer',
    #         #     protocol='websocket'
    #         # ),
    #         # UrlMap(
    #         #     name='install_git',
    #         #     url='app-store/install/git',
    #         #     controller='app_store.controllers.run_git_install',
    #         # ),
    #         # UrlMap(
    #         #     name='git_get_status',
    #         #     url='app-store/install/git/status',
    #         #     controller='app_store.controllers.get_status',                EJones
    #         # ),
    #         # UrlMap(
    #         #     name='git_get_logs',
    #         #     url='app-store/install/git/logs',
    #         #     controller='app_store.controllers.get_logs',                  EJones
    #         # ),
    #         # UrlMap(
    #         #     name='install_git_override',
    #         #     url='app-store/install/git_override',
    #         #     controller='app_store.controllers.run_git_install_override',  EJones
    #         # ),
    #         # UrlMap(
    #         #     name='git_get_status_override',
    #         #     url='app-store/install/git/status_override',
    #         #     controller='app_store.controllers.get_status_override',       EJones
    #         # ),
    #         # UrlMap(
    #         #     name='git_get_logs_override',
    #         #     url='app-store/install/git/logs_override',
    #         #     controller='app_store.controllers.get_logs_override',         EJones
    #         # ),
    #         # UrlMap(
    #         #     name='scaffold_app',
    #         #     url='app-store/scaffold',
    #         #     controller='app_store.controllers.scaffold_command',          EJones
    #         # ),
    #         # UrlMap(
    #         #     name='scaffold_submit',
    #         #     url='app-store/scaffold_submit',
    #         #     controller='app_store.controllers.run_submit_nursery_app',    EJones
    #         # )

    #     )

    #     return url_maps

    def permissions(self):
        """
        Require admin to use the app.
        """
        use_app_store = Permission(
            name='use_app_store',
            description='Use the App Store'
        )

        admin = PermissionGroup(
            name='admin',
            permissions=(use_app_store,)
        )

        permissions = (admin,)

        return permissions

    def custom_settings(self):
        return (
            CustomSetting(
                name='sudo_server_pass',
                type=CustomSetting.TYPE_STRING,
                description='Sudo password for server',
                required=False
            ),
        )

        return custom_settings
