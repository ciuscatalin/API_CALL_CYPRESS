/// <reference types="Cypress" />

//Test case
describe('REST API Test with Cypress', () => {
	let username, password, token, projId, templateQuizId, stageId, authorization

	//Getting data from a .Json file before the test are executed
	before('Get data from fixture.',() =>{
		cy.fixture('credential').then(data => {
			username = data.username		//getting username from fixture file
			password = data.password		//getting password from fixture file
			token = data.tokenAD			//getting the token from fixture file
		})
	})
	

   	// CALL THE LOGIN REQUEST 						
  	it('Login with Cypress Request', () =>{
		cy.request({
			method:'POST', 																		// Methode called
			url: 'https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/login',		// Url with the endpoint
			body:{																				// The body with data 
				username: username,
				password: password, 
				tokenAD: token
			},
			failOnStatusCode: false																// Go throu even if the request fail 
		}).as('login')																			// Save as alias
		
		//CHECK IF IN THE RESPONSE BODY EXIST 'TOKEN'
		cy.get('@login')
			.its('body')
			.should('have.property', 'token').then( data => {	// check if the respons body contain a property with the name of "token"
				authorization = data							// get that data from response body, if mandatory for the other call
			})

		//CHECK IF STATUS IS 200(OK)
		cy.get('@login')			//@login is an alias for the request call.
			.its('status')			// select its status for next test
			.should('equal', 200)	// with the status selected check if is equal with 200 which is the ok status for requests (200, 201, 203)
			.then(() => {
				cy.log(`Succesfull login with username: ${username}`)	// if status is 200 display a message for user in which say "succesfull login with the username"
			})
		// cy.wait(2000).log("Wait for 2second is for demo purposes")	
	})


	// CALL FOR CREATING A NEW PROJECT 					------------------------------------
	it('Create a project for a user Cypress Request', () =>{
		cy.request({
			method:'POST', 
			url: 'https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects', 	//end-point for the 'add projects is  /api/project'
			body:{
				name: 'Project',				// the name of the project
				description: 'Simple Project'  	// a simple description of the project
			},
			headers:{
				Authorization: authorization	//after last update om the backend, cookies does not work anymore and we need to include in the request the token from autentification.
			}
		}).as('project')

		//CHECK THE BODY AND GET THE PROJECT ID FROM THE PROJECT CREATED
		cy.get('@project')
			.its('body')
			.then( i => {				// iterate throw all the values in the response body
				projId = i.projectId	// if the call was succesful, it's body should contain a unique 'id' for the new created project.
			})

		//CHECK IF STATUS CODE IS 201(CREATED)
		cy.get('@project')
			.its('status')
			.should('equal', 201).then(() =>{		//if the status code is 201(created) the we continue with other call for adding this user as a contribuitor for the new created project.
				cy.log(`A project was create with id: ${projId}`)		// we display a message for the user in which is inform that a new project was created with id stored in projId

				// cy.wait(2000).log("Wait for 2second is for demo purposes")

				// CALL FOR ADDING NEW CONTRIBUTOR TO A NEW PROJECT 
				cy.request({
					method:'POST', 
					url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects/contributors/${projId}/${username}`,		//using ${} we can display the actual value of the variable with that name
					body:{
						name: 'Project',				 
						description: 'Simple Project'  
					},
					headers:{
						Authorization: authorization			//after last update om the backend, cookies does not work anymore and we need to include in the request the token from autentification.
					}
					// failOnStatusCode: false,					// this command is used for passing the request even if it fails 	!!!! TRY NOT USING IT IF YOU DON'T KNOW WHAT ARE YOU DOING !!!!
				}).as('contributor')
		
				//CHECK IF RESPONSE CODE IS 204(NO CONTENT)
				cy.get('@contributor')
					.its('status')
					.should('equal', 204)			//check to see status code is 204 which is a good one
					.then(() =>{
						cy.log(`Contributor: ${username} added to project with id: ${projId}`)		//display some info for the user.
					})
				// cy.wait(2000).log("Wait for 2second is for demo purposes")
			})
	})

	//CALL FOR CREATING A NEW TEMPLATE QUIZ
	it("Add new template quiz request", () => {
		cy.request({
			method: "POST",
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/template-quizzes?projectId=${projId}`,	// enpoint for this request contain also a filter everything is after '?'
			headers:{																										// in this case is 'projectId=${projId}', help us to set only on this project a new templeta quizz
				Authorization: authorization			//after last update om the backend, cookies does not work anymore and we need to include in the request the token from autentification
			}
		}).as('quiz')
		
		cy.get('@quiz')
			.its('body')
			.then(i => {
				templateQuizId = i.templateQuizId 		// after create a new teampleQuizz an unique id is auto-generated so we get it and store in the templetQuizId for next use.
			})
		cy.get('@quiz')
			.its('status')
			.should('equal', 201)
			.then(() =>{	
				cy.log("Template quiz created with id " + templateQuizId)		 //display some info for user.
			})
	
		// cy.wait(2000).log("Wait for 2second is for demo purposes")
		
		})


	// CALL FOR CREATING A NEW STAGE
	it("Add new stage request", () => {
		cy.request({
			method: "POST",
			url: "https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/stages",
			body: {										//almost all the body for the request of a POST request need to contain info in the body
				"templateQuizId": templateQuizId,		// stage is added on a already existing template quiz
				"stageName": "Stage Test1",
				"points": 10.0
			},
			headers:{
				Authorization: authorization			//after last update om the backend, cookies does not work anymore and we need to include in the request the token from autentification.
			}
		}).as('stage')

		cy.get('@stage')
			.its('body')
			.then(stage => {
				stageId = stage.stageId;	//save the if return from the server for later delete of this stage. 'KEEP IT CLEAN'
			})

		cy.get('@stage')
			.its('status')
			.should('equal', 201)		// status 201 mean created which is ok for us if happens
			.then(() => {
				cy.log("Stage created with Id " + stageId)			// an info for user.
			})
		
		// cy.wait(2000).log("Wait for 2second is for demo purposes")		//demo porpuses waits because the request are really really fast.

	})


	// CALL FOR GETTING ALL THE PROJECT IN WHICH USER IS A CONTRIBUTOR 
	it('Get projects for a user Cypress Request', () =>{
		cy.request({
			method:'GET', 
			url: 'https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects/', 		//same enpoint could exist with different method call on them.
			headers:{
				Authorization: authorization			//after last update om the backend, cookies does not work anymore and we need to include in the request the token from autentification.
			}
		}).as('projects')

		//VERIFY IF HEADER CONTAIN 'APPLICATION/JSON'
		cy.get('@projects')
			  .its('headers')
			  .its('content-type')
			  .should('include', 'application/json')	//verify also header of response for more validation.

		//CHECK BODY OF THE RESPONSE AND DISPLAY ALL THE PROJECT IN WHICH USER IS CONTRIBUTOR
		cy.get('@projects')
			.its('body')
			.each(i => {
				cy.log(` ${i.projectId} :: ${i.name} :: ${i.description}`)		//display all the project in which current user is contributor. //this is just a representation.
			})

		//CHECK STATUS CODE TO BE 200(OK)
		cy.get('@projects')
			.its('status')
			.should('equal', 200)	//status 200 mean ok 

		// cy.wait(2000).log("Wait for 2second is for demo purposes")

	})


	// CALL FOR DELETING A STAGE
	it("Delete stage request", () => {
		cy.log(`Delete stage with id ${stageId}`)		// an info for user to know which stage is going to be delete
		cy.request({
			method: "DELETE",
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/stages/${stageId}`,		//DELETE request and id of stage to identify which stage should be deleted
			headers:{
				Authorization: authorization			//after last update om the backend, cookies does not work anymore and we need to include in the request the token from autentification.
			}
		}).as('stage')
			
		cy.get('@stage')
			.its('status')
			.should('equal', 204)			//check status code for make sure is the rigth one
			.then(() => {
				cy.log(`Stage with id:${stageId} has been deleted`)		// info for user which make sure the stage with 'stageId' is deleted.
			})	

		// cy.wait(2000).log("Wait for 2second is for demo purposes")
		
	})

	// CALL FOR DELETING A TEMPLET QUIZ
	it("Delete template quiz request", () => {
		cy.log(`Delete template quiz with id ${templateQuizId}`)		// an info for user to know which template quizz will be delete.
		cy.request({
			method: "DELETE",
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/template-quizzes/${templateQuizId}`,		//DELETE request and id of template quizz to identify which  should be deleted
			headers:{		
				Authorization: authorization			//after last update om the backend, cookies does not work anymore and we need to include in the request the token from autentification.
			}
		}).as('quiz')
		
		//CHECK IF RESPONSE CODE IS 204(NO CONTENT)
		cy.get('@quiz')
			.its('status')
			.should('equal', 204)	//status cpde 204(no content) usually on delete request.
			.then(() => {
				cy.log(`Template Quiz with id:${templateQuizId} has been deleted`)
			})		

			// cy.wait(2000).log("Wait for 2second is for demo purposes")
		
		})
		

	// DELETE PROJECT  
	it('Delete a project for a user Cypress Request', () =>{
		cy.request({
			method:'DELETE', 
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects/${projId}`,
			headers:{
				Authorization: authorization			//after last update om the backend, cookies does not work anymore and we need to include in the request the token from autentification.
			}
		}).as('project')
	
		//CHECK IF RESPONSE CODE IS 204(NO CONTENT)
		cy.get('@project')
			.its('status')
			.should('equal', 204)		//checking status to be 204, if the delete was succesfully
			.then(() => {
				cy.log(`Project with id:${projId} has been deleted`)		// an info for user
			})

		// cy.wait(2000).log("Wait for 2second is for demo purposes")

	})
})
// cy.wait('@projects') !!!!!!!