/// <reference types="Cypress" />

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
			.should('have.property', 'token').then( data => {
				authorization = data
			})

		//CHECK IF STATUS IS 200(OK)
		cy.get('@login')
			.its('status')
			.should('equal', 200)
			.then(() => {
				cy.log(`Succesfull login with username: ${username}`)
			})
		cy.wait(2000).log("Wait for 2second is for demo purposes")
	})


	// CALL FOR CREATING A NEW PROJECT 					------------------------------------
	it('Create a project for a user Cypress Request', () =>{
		cy.request({
			method:'POST', 
			url: 'https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects',
			body:{
				name: 'Project',
				description: 'Simple Project'  
			},
			headers:{
				Authorization: authorization
			}
		}).as('project')

		//CHECK THE BODY AND GET THE PROJECT ID FROM THE PROJECT CREATED
		cy.get('@project')
			.its('body')
			.then( i => {
				projId = i.projectId
			})

		//CHECK IF STATUS CODE IS 201(CREATED)
		cy.get('@project')
			.its('status')
			.should('equal', 201).then(() =>{
				cy.log(`A project was create with id: ${projId}`)

				cy.wait(2000).log("Wait for 2second is for demo purposes")

				// CALL FOR ADDING NEW CONTRIBUTOR TO A NEW PROJECT 
				cy.request({
					method:'POST', 
					url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects/contributors/${projId}/${username}`,
					body:{
						name: 'Project',
						description: 'Simple Project'  
					},
					headers:{
						Authorization: authorization
					}
					// failOnStatusCode: false,
				}).as('contributor')
		
				//CHECK IF RESPONSE CODE IS 204(NO CONTENT)
				cy.get('@contributor')
					.its('status')
					.should('equal', 204)
					.then(() =>{
						cy.log(`Contributor: ${username} added to project with id: ${projId}`)
					})
				cy.wait(2000).log("Wait for 2second is for demo purposes")
			})
	})

	//CALL FOR CREATING A NEW TEMPLATE QUIZ
	it("Add new template quiz request", () => {
		cy.request({
			method: "POST",
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/template-quizzes?projectId=${projId}`,
			headers:{
				Authorization: authorization
			}
		}).as('quiz')
		
		cy.get('@quiz')
			.its('body')
			.then(i => {
				templateQuizId = i.templateQuizId
			})
		cy.get('@quiz')
			.its('status')
			.should('equal', 201)
			.then(() =>{	
				cy.log("Template quiz created with id " + templateQuizId)
			})
	
		cy.wait(2000).log("Wait for 2second is for demo purposes")
		
		})


	// CALL FOR CREATING A NEW STAGE
	it("Add new stage request", () => {
		cy.request({
			method: "POST",
			url: "https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/stages",
			body: {
				"templateQuizId": templateQuizId,
				"stageName": "Stage Test1",
				"points": 10.0
			},
			headers:{
				Authorization: authorization
			}
		}).as('stage')

		cy.get('@stage')
			.its('body')
			.then(stage => {
				stageId = stage.stageId;
			})

		cy.get('@stage')
			.its('status')
			.should('equal', 201)
			.then(() => {
				cy.log("Stage created with Id " + stageId)
			})
		
		cy.wait(2000).log("Wait for 2second is for demo purposes")

	})


	// CALL FOR GETTING ALL THE PROJECT IN WHICH USER IS A CONTRIBUTOR 
	it('Get projects for a user Cypress Request', () =>{
		cy.request({
			method:'GET', 
			url: 'https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects/',
			headers:{
				Authorization: authorization
			}
		}).as('projects')

		//VERIFY IF HEADER CONTAIN 'APPLICATION/JSON'
		cy.get('@projects')
			  .its('headers')
			  .its('content-type')
			  .should('include', 'application/json')

		//CHECK BODY OF THE RESPONSE AND DISPLAY ALL THE PROJECT IN WHICH USER IS CONTRIBUTOR
		cy.get('@projects')
			.its('body')
			.each(i => {
				cy.log(` ${i.projectId} :: ${i.name} :: ${i.description}`)		
			})

		//CHECK STATUS CODE TO BE 200(OK)
		cy.get('@projects')
			.its('status')
			.should('equal', 200)

		cy.wait(2000).log("Wait for 2second is for demo purposes")

	})


	// CALL FOR DELETING A STAGE
	it("Delete stage request", () => {
		cy.log(`Delete stage with id ${stageId}`)
		cy.request({
			method: "DELETE",
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/stages/${stageId}`,
			headers:{
				Authorization: authorization
			}
		}).as('stage')
			
		cy.get('@stage')
			.its('status')
			.should('equal', 204)
			.then(() => {
				cy.log(`Stage with id:${stageId} has been deleted`)
			})	

		cy.wait(2000).log("Wait for 2second is for demo purposes")

	})

	// CALL FOR DELETING A TEMPLET QUIZ
	it("Delete template quiz request", () => {
		cy.log(`Delete template quiz with id ${templateQuizId}`)
		cy.request({
			method: "DELETE",
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/template-quizzes/${templateQuizId}`,
			headers:{
				Authorization: authorization
			}
		}).as('quiz')
			
		//CHECK IF RESPONSE CODE IS 204(NO CONTENT)
		cy.get('@quiz')
			.its('status')
			.should('equal', 204)
			.then(() => {
				cy.log(`Template Quiz with id:${templateQuizId} has been deleted`)
			})		
	})
	

	// DELETE PROJECT  
	it('Delete a project for a user Cypress Request', () =>{
		cy.request({
			method:'DELETE', 
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects/${projId}`,
			headers:{
				Authorization: authorization
			}
		}).as('project')
	
		//CHECK IF RESPONSE CODE IS 204(NO CONTENT)
		cy.get('@project')
			.its('status')
			.should('equal', 204)
			.then(() => {
				cy.log(`Project with id:${projId} has been deleted`)
			})

		cy.wait(2000).log("Wait for 2second is for demo purposes")

	})
})
// cy.wait('@projects') !!!!!!!