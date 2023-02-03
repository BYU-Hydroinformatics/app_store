const addModalHelper = {
  validationResults: (validationData,content, completeMessage, ws ) =>{
    if(!validationData.metadata['next_move']){
      $("#failMessage").html(validationData.mssge_string)
      $("#failMessage").show()
      $("#loaderEllipsis").hide()
      $("#loadingTextAppSubmit").text("")
      $("#fetchRepoButton").prop("disabled", false)
    }
    else{
      $("#failMessage").html(validationData.mssge_string)
      $("#failMessage").show()
      notification_ws.send(
          JSON.stringify({
              data: {
                  url: validationData.metadata['submission_github_url']
              },
              type: `pull_git_repo`
          })
      )
    }

  },
  showBranches: (branchesData, content, completeMessage, ws) => {
    // Clear loader and button:

    $("#loaderEllipsis").hide()
    $("#fetchRepoButton").hide()
    $("#loadingTextAppSubmit").text("")

    if (!("branches" in branchesData)) {
      sendNotification(
        "Error while checking the repo for branches. Please ensure the repo is public.",
        $("#branchesList")
      )
      return
    }

    if (branchesData["branches"].length == 1) {
      sendNotification(
        `One branch found. Continuing packaging with ${
          branchesData["branches"][0]
        } branch.`,
        $("#branchesList")
      )
      $("#loaderEllipsis").show()
      $("#processBranchButton").prop("disabled", true)
      $("#loadingTextAppSubmit").text(
        `Please wait. Processing branch: ${branchesData["branches"][0]}`
      )

      // notification_ws.send(
      //   JSON.stringify({
      //       data: {
      //           url: githubURL
      //       },
      //       type: `validate_git_repo`
      //   })
      // )
      notification_ws.send(
        JSON.stringify({
          data: {
            branch: branchesData["branches"][0],
            github_dir: branchesData["github_dir"],
            email: $("#notifEmail").val(),
            dev_url: $("#githubURL").val()

          },
          type: `process_branch`
        })
      )
      return
    }

    // More than one branch available. Ask user for option:
    let branchesHTML = htmlHelpers.getBranches(branchesData["branches"])
    $("#branchesList").append(branchesHTML)

    $("#processBranchButton").click((e) => {
      let branchName = $("#add_branch").val()

      $("#loaderEllipsis").show()
      $("#processBranchButton").prop("disabled", true)
      $("#loadingTextAppSubmit").text(
        `Please wait. Processing branch: ${branchName}`
      )

      notification_ws.send(
        JSON.stringify({
          data: {
            branch: branchName,
            github_dir: branchesData["github_dir"],
            email: $("#notifEmail").val()
          },
          type: `process_branch`
        })
      )
    })
    $("#processBranchButton").show()
    $("#failMessage").hide()

  },
  addComplete: (addData, content, completeMessage, ws) => {
    $("#loaderEllipsis").hide()
    $("#processBranchButton").hide()
    $("#cancelAddButton").hide()
    $("#loadingTextAppSubmit").text("")
    if (addData.job_url) {
      $("#addSuccessLink").html(
        `<a href="${addData.job_url}" target="_blank">here</a>`
      )
    } else {
      // Hide the link part of the success message
      $("#SuccessLinkMessage").hide()
    }
    $("#doneAddButton").show()
    $("#successMessage").show()
    $("#failMessage").hide()

  }
}
