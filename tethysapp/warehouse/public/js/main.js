// Some Constant Vars being used across the script
// Probably need a better way to manage this state though
var notifCount = 0
// End Vars
const settingsHelper = {
    processCustomSettings: (settingsData, n_content, completeMessage, ws) => {
        if (settingsData) {
            if (settingsData.length > 0) {
                $("#skipConfigButton").click(function() {
                    ws.send(
                        JSON.stringify({
                            data: {
                                app_py_path: completeMessage["app_py_path"],
                                skip: true
                            },
                            type: completeMessage.returnMethod
                        })
                    )
                })

                $("#custom-settings-modal").modal("show")
                $("#custom-settings-container").prepend(`<div>
                    <p>We found ${settingsData.length} custom setting${
                    settingsData.length > 1 ? "s" : ""
                }    
                    </p>
                    </div>
                    `)
                let formDataElement = $("#custom-settings-container").children("form")
                settingsData.forEach((setting) => {
                    let defaultValue = setting.default ? setting.default : ""
                    let newElement = `
                    <div class="form-group">
                        <label for="${setting.name}">${setting.name}</label>
                        <input type="text" class="form-control" id="${setting.name}" value="${defaultValue}">
                        <p class="help-block">${setting.description}</p>
                    </div>`
                    formDataElement.append(newElement)
                })

                formDataElement.append(
                    `<button type="submit" class="btn btn-success">Submit</button>`
                )
                formDataElement.submit(function(event) {
                    event.preventDefault()
                    let formData = { settings: {} }
                    if ("app_py_path" in completeMessage) {
                        formData["app_py_path"] = completeMessage["app_py_path"]
                    }
                    $("#custom-settings-container")
                        .children("form")
                        .find(".form-control")
                        .each(function() {
                            formData.settings[$(this).attr("id")] = $(this).val()
                        })

                    ws.send(
                        JSON.stringify({
                            data: formData,
                            type: completeMessage.returnMethod
                        })
                    )
                })
            } else {
                ws.send(
                    JSON.stringify({
                        data: {
                            app_py_path: completeMessage["app_py_path"],
                            skip: true,
                            noneFound: true
                        },
                        type: completeMessage.returnMethod
                    })
                )
                sendNotification("No Custom Settings found to process", n_content)
            }
        } else {
            sendNotification("No Custom Settings found to process", n_content)
        }
    },
    customSettingConfigComplete: (settingsData, n_content, completeMessage, ws) => {
        $("#custom-settings-modal").modal("hide")
    },
    getSettingName: (settingType) => {
        const settingMap = {
            spatial: "Spatial Dataset Service",
            persistent: "Persistent Store Service",
            dataset: "Dataset Service",
            wps: "Web Processing Services"
        }
        if (settingType in settingMap) {
            return settingMap[settingType]
        } else {
            console.log("Error: Could not find setting for settingtype: ", settingType)
            return ""
        }
    },
    processServices: (servicesData, n_content, completeMessage, ws) => {
        // Check if there are any services to configure. Otherwise move on to next step
        if (servicesData) {
            if (servicesData.length > 0) {
                console.log(servicesData)
                $("#services-modal").modal("show")
                $("#services-container").prepend(`<div>
                    <p>We found ${servicesData.length} service configuration${
                    servicesData.length > 1 ? "s" : ""
                }    
                    </p>
                    </div>
                    `)
                servicesData.forEach((service) => {
                    let settingName = settingsHelper.getSettingName(service.service_type)
                    let optionsElement = ""
                    if (service.options.length > 0) {
                        optionsElement += `<p>We found ${
                            service.options.length
                        } existing service${service.options.length > 1 ? "s" : ""}: ${
                            getServicesHTML(service.options, service.name).outerHTML
                        }</p>
                        <input id="servicesToConfigureCount" hidden value="${
                            service.options.length
                        }" />
                        `
                    }
                    let newElement = `
                    <div class="card card-default">
                        <div class="card-header">${settingName}: ${service.name}</div>
                        <div class="card-body">
                            <p>${service.description}</p>
                            ${optionsElement}
                             <button class="btn btn-primary" id="${
                                 service.name
                             }_useExisting">Use Selected Service</button>
                             <button class="btn btn-success" style="float: right" id="${
                                 service.name
                             }_createNew">Create New Service</button>
                        </div>
                        <div class="card-footer ">
                           <div id="${service.name}_loaderImage" hidden="">
                           Loading...
                               ${$("#notification .modal-footer")
                                   .find("img")
                                   .html()}
                           </div>
                           <div id="${service.name}_successMessage" hidden="">
                           Service Configuration Completed
                           </div>
                        </div>
                    </div>`
                    $("#services-container").append(newElement)
                    $(`#${service.name}_useExisting`).click(function() {
                        $(`#${service.name}_loaderImage`).show()
                        // Send WS request to set this.

                        ws.send(
                            JSON.stringify({
                                data: {
                                    app_py_path: completeMessage["app_py_path"],
                                    service_name: service.name,
                                    service_type: service.service_type,
                                    setting_type: service.setting_type,
                                    app_name: completeMessage.current_app_name,
                                    service_id: $(`#${service.name}_options`).val()
                                },
                                type: completeMessage.returnMethod
                            })
                        )
                    })
                    // $(`#${service.name}_createNew`).click(function() {})
                })
            } else {
                sendNotification("No Services found to process", n_content)
                sendNotification("install_complete", n_content)
            }
        } else {
            sendNotification("No Services found to process", n_content)
            sendNotification("install_complete", n_content)
        }
    },
    serviceConfigComplete: (data, n_content, completeMessage, ws) => {
        // Assuming Successfull configuration for now
        // @TODO : Allow for error reporting and re attempts

        // Find Service and show success
        let serviceName = data.serviceName
        $(`#${serviceName}_loaderImage`).hide()
        $(`#${serviceName}_successMessage`).show(400)

        // Check if there are more services to configure, else enable finish button

        if (parseInt($(`#servicesToConfigureCount`).val()) == 1) {
            // We are done
            $(`#finishServicesButton`).prop("disabled", false)
            sendNotification("install_complete", n_content)
        } else {
            $(`#servicesToConfigureCount`).val(
                parseInt($(`#servicesToConfigureCount`).val()) - 1
            )
        }
    }
}

const sendNotification = (message, n_content) => {
    notifCount = notifCount + 1
    let new_element = `<div style="display: none;" id="install_notif_${notifCount}">${message}</div>`
    if (message == "install_complete") {
        hideLoader()
        new_element = `<div style="display: none;" id="install_notif_${notifCount}">Install Complete. Please restart your Tethys instance for changes to take effect. </div>`
    }
    n_content.append(new_element)
    $(`#install_notif_${notifCount}`).show("fast")
}

// Converts the list of versions into an HTML dropdown for selection
const getServicesHTML = (options, service_name) => {
    let sel = document.createElement("select"),
        options_str = ""

    sel.name = `${service_name}_options`
    sel.id = `${service_name}_options`

    options.forEach(function(option) {
        options_str += `<option value='${option.id}'>${option.name}</option>`
    })

    sel.innerHTML = options_str
    return sel
}

// Converts the list of versions into an HTML dropdown for selection
const getVersionsHTML = (selectedApp, allResources) => {
    let app = allResources.filter((resource) => resource.name == selectedApp)
    if (app.length > 0) {
        let versions = app[0].metadata.versions.reverse()

        let sel = document.createElement("select"),
            options_str = ""

        sel.name = "versions"
        sel.id = "versions"

        versions.forEach(function(version) {
            options_str += `<option value='${version}'>${version}</option>`
        })

        sel.innerHTML = options_str
        return sel
    } else {
        console.log("No App found with that name. Check input params")
    }
}

const hideLoader = () => {
    $("#notification .modal-footer")
        .find("img")
        .hide()
}

const showLoader = () => {
    $("#notification .modal-footer")
        .find("img")
        .show()
}

const startInstall = (appInstallURL) => {
    showLoader()
    let installURL = `${appInstallURL}&version=${$("#versions").select2("data")[0].text}`
    $.get(installURL, function(data) {
        console.log(data)
    })
}

$(document).ready(function() {
    let n_div = $("#notification")
    let n_content = $("#notification .lead")
    hideLoader()
    let notification_ws = new WebSocket(
        "ws://" + window.location.host + "/warehouse/install/notifications/ws/"
    )

    $("#app_button").click(function() {
        n_content.empty()
        n_div.modal()
        notifCount = 0
        // Setup Versions
        let versionHTML = getVersionsHTML($(this).data("app-name"), resources)
        n_content.append(
            `<div>Which version would you like to install: 
                <div id="selectVersion" style="display: inline-block;"></div>
                <a class="btn btn-primary" onclick="startInstall('${$(this).data(
                    "install-url"
                )}')"> Go </a>
            </div>
            `
        )
        n_content.find("#selectVersion").append(versionHTML)
        $("#versions").select2()
    })

    notification_ws.onmessage = function(e) {
        let data = JSON.parse(e.data)
        if (typeof data.message == "string") {
            // It's normal string
            sendNotification(data.message, n_content)
            return false
        } else {
            // Found an object?
            // Check if we have a function to call
            if ("jsHelperFunction" in data.message) {
                settingsHelper[data.message["jsHelperFunction"]](
                    data.message.data,
                    n_content,
                    data.message,
                    notification_ws
                )
            }
        }
    }
})
