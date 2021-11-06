/// <reference types="Cypress" />

describe('REST API Test with Cypress', () => {
	var projId
	// var delProjId = 31

   	// CALL THE LOGIN REQUEST 							------------------------------------
  	it('Login with Cypress Request', () =>{
		cy.request({
			method:'POST', 
			url: 'https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/login',
			body:{
				username: 'tech.admin@accesa.eu',
				password: 'admin', 
				tokenAD: 'activeDirectoryTokenFE'
			}
		}).as('login')
		
		//VERIFY IF HEADER CONTAIN 'APPLICATION/JSON'
		cy.get('@login')
			  .its('headers')
			  .its('content-type')
			  .should('include', 'application/json')
		
		//CHECK IF IN THE RESPONSE BODY EXIST 'TOKEN'
		cy.get('@login')
			.its('body')
			.should('have.property', 'token')

		//CHECK IF STATUS IS 200(OK)
		cy.get('@login')
			.its('status')
			.should('equal', 200)
	})


	// CALL FOR CREATING A NEW PROJECT 					------------------------------------
	it('Create a project for a user Cypress Request', () =>{
		cy.request({
			method:'POST', 
			url: 'https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects',
			body:{
				name: 'Project',
				description: 'Simple Project'  
			}
		}).as('project')

		//VERIFY IF HEADER CONTAIN 'APPLICATION/JSON'
		cy.get('@project')
			  .its('headers')
			  .its('content-type')
			  .should('include', 'application/json')

		//CHECK THE BODY AND GET THE PROJECT ID FROM THE PROJECT CREATED
		cy.get('@project')
			.its('body')
			.then( i => {
				cy.log(`A project was create with id: ${i.projectId}`)
				projId = i.projectId
			})

		//CHECK IF STATUS CODE IS 201(CREATED)
		cy.get('@project')
			.its('status')
			.should('equal', 201)
	})


	// CALL FOR ADDING A NEW CONTRIBUTOR ON A PROJECT
	it('Add contributor to a project for a user Cypress Request', () =>{
		cy.request({
			method:'POST', 
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects/contributors/${projId}/tech.admin@accesa.eu`,
			body:{
				name: 'Project',
				description: 'Simple Project'  
			},
			failOnStatusCode: false,
		}).as('contributor')

		//VERIFY IF HEADER CONTAIN 'TEXT/HTML'
		cy.get('@contributor')
			  .its('headers')
			  .its('content-type')
			  .should('include', 'text/html')

		//CHECK IF RESPONSE CODE IS 204(NO CONTENT)
		cy.get('@contributor')
		.its('status')
		.should('equal', 204)
	})
	

	// CALL FOR GETTING ALL THE PROJECT IN WHICH USER IS A CONTRIBUTOR 
	it('Get projects for a user Cypress Request', () =>{
		cy.request({
			method:'GET', 
			url: 'https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects/'
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
	})


	// DELETE PROJECT  
	it('Get projects for a user Cypress Request', () =>{
		cy.request({
			method:'DELETE', 
			url: `https://accesa-internship-portal-be-asvanwz5ea-ez.a.run.app/api/projects/${projId}`
		}).as('projects')

		//VERIFY IF HEADER CONTAIN 'APPLICATION/JSON'
		cy.get('@projects')
			  .its('headers')
			  .its('content-type')
			  .should('include', 'text/html')

		
		//CHECK IF RESPONSE CODE IS 204(NO CONTENT)
		cy.get('@projects')
			.its('status')
			.should('equal', 204)
	})
})
