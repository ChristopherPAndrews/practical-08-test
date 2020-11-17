

import { render, screen, waitFor } from '@testing-library/react';
import path from "path";
import request from "supertest";
import fetchMock from 'fetch-mock-jest';
import {
  startApp,
  stopApp,
  nextBuild,
  nextServer,
} from "../test-utils/next-test-utils";
import { getSession, useSession } from 'next-auth/client';

import SecurePage from "../pages/secure";


const appDir = path.join(__dirname, "../../");


jest.setTimeout(1000 * 15);

jest.mock("next-auth/client");


describe("Server tests", ()=>{
 let server;

 beforeAll( async ()=>{
 await nextBuild(appDir);
 });

  beforeEach(async () => {
    
   
    const app = nextServer({
      dir: appDir,
      dev: false,
      quiet: true,
    });
   
    server = await startApp(app);
  
    
  });

  /**
   * Shut down the server
   */
  afterEach(async () => {
    await stopApp(server)
  });

  test('Secured login gets message', (done)=>{
    getSession.mockReturnValueOnce({user: {email:'somebody@somwhere.org'}});

    request(server)
    .get("/api/secret")
    .expect(200)
    .expect('Content-Type', /json/)
    .expect({message:"Don't Panic!"}, done);
  });

  test('Insecure access is denied', (done)=>{
getSession.mockReturnValueOnce();

    request(server)
    .get("/api/secret")
    .expect(401, done);
  });

});


describe("Client tests",()=>{
  test('Secured login displays message', async()=>{
    fetchMock.get('/api/secret', ()=>({message:"Test message"}))
    useSession.mockReturnValue([{user: {email:'somebody@somwhere.org'}}, false]);
    render(<SecurePage />);

    await waitFor(()=> expect(fetchMock.called('/api/secret')).toBeTruthy());
    const message = await screen.findByText("Test message");
    expect(message).toBeInTheDocument();
   

  });

  test('Insecure access is denied', ()=>{
    useSession.mockReturnValueOnce([undefined , false]);
    render(<SecurePage />);

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });
})


