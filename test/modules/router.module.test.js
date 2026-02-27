import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import routerModule from '../../src/modules/router.module.js';

chai.use(sinonChai);
const { expect } = chai;

describe('router.module', () => {
  describe('router setup', () => {
    it('should be a function', () => {
      expect(routerModule).to.be.a('function');
    });

    it('should set up application routes', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      expect(mockApp.use.called).to.be.true;
    });

    it('should set up /application route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const applicationRoute = calls.find(
        (call) => call.args[0] === '/application'
      );
      expect(applicationRoute).to.exist;
    });

    it('should set up /application/storage route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const storageRoute = calls.find(
        (call) => call.args[0] === '/application/storage'
      );
      expect(storageRoute).to.exist;
    });

    it('should set up /argument route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const argumentRoute = calls.find((call) => call.args[0] === '/argument');
      expect(argumentRoute).to.exist;
    });

    it('should set up /auth route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const authRoute = calls.find((call) => call.args[0] === '/auth');
      expect(authRoute).to.exist;
    });

    it('should set up /category route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const categoryRoute = calls.find((call) => call.args[0] === '/category');
      expect(categoryRoute).to.exist;
    });

    it('should set up /datacenter route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const datacenterRoute = calls.find(
        (call) => call.args[0] === '/datacenter'
      );
      expect(datacenterRoute).to.exist;
    });

    it('should set up /environment route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const environmentRoute = calls.find(
        (call) => call.args[0] === '/environment'
      );
      expect(environmentRoute).to.exist;
    });

    it('should set up /imageType route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const imageTypeRoute = calls.find(
        (call) => call.args[0] === '/imageType'
      );
      expect(imageTypeRoute).to.exist;
    });

    it('should set up /img route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const imgRoute = calls.find((call) => call.args[0] === '/img');
      expect(imgRoute).to.exist;
    });

    it('should set up /interface route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const interfaceRoute = calls.find(
        (call) => call.args[0] === '/interface'
      );
      expect(interfaceRoute).to.exist;
    });

    it('should set up /nodeSelector route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const nodeSelectorRoute = calls.find(
        (call) => call.args[0] === '/nodeSelector'
      );
      expect(nodeSelectorRoute).to.exist;
    });

    it('should set up /portType route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const portTypeRoute = calls.find((call) => call.args[0] === '/portType');
      expect(portTypeRoute).to.exist;
    });

    it('should set up /session route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const sessionRoute = calls.find((call) => call.args[0] === '/session');
      expect(sessionRoute).to.exist;
    });

    it('should set up /user route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const userRoute = calls.find((call) => call.args[0] === '/user');
      expect(userRoute).to.exist;
    });

    it('should set up /variableEnvironment route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const variableEnvironmentRoute = calls.find(
        (call) => call.args[0] === '/variableEnvironment'
      );
      expect(variableEnvironmentRoute).to.exist;
    });

    it('should set up base root route', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const rootRoute = calls.find((call) => call.args[0] === '/');
      expect(rootRoute).to.exist;
    });

    it('should set up wildcard route for 404 handling', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const wildcardRoute = calls.find((call) => call.args[0] === '/*');
      expect(wildcardRoute).to.exist;
    });

    it('should set up all routes in correct order', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      // Wildcard route should be the last one for proper 404 handling
      expect(calls[calls.length - 1].args[0]).to.equal('/*');
    });

    it('should pass router handlers to app.use', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      // Each route should have a path and handler
      for (const call of calls) {
        expect(call.args).to.have.length.at.least(2);
      }
    });

    it('should not modify the app object beyond using use() method', () => {
      const mockApp = {
        use: sinon.stub(),
        listen: sinon.stub(),
      };

      routerModule(mockApp);

      expect(mockApp.listen.called).to.be.false;
    });

    it('should handle multiple calls without issues', () => {
      const mockApp1 = { use: sinon.stub() };
      const mockApp2 = { use: sinon.stub() };

      routerModule(mockApp1);
      routerModule(mockApp2);

      expect(mockApp1.use.called).to.be.true;
      expect(mockApp2.use.called).to.be.true;
    });

    it('should accept app parameter', () => {
      expect(() => {
        const mockApp = { use: sinon.stub() };
        routerModule(mockApp);
      }).to.not.throw();
    });

    it('should provide 404 handler for wildcards', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const wildcardCall = mockApp.use
        .getCalls()
        .find((call) => call.args[0] === '/*');

      expect(wildcardCall).to.exist;
      expect(wildcardCall.args[1]).to.be.a('function');
    });

    it('should set up at least 17 routes', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      expect(mockApp.use.callCount).to.be.at.least(17);
    });

    it('should apply BASE route before wildcard', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const baseRouteIndex = calls.findIndex((call) => call.args[0] === '/');
      const wildcardRouteIndex = calls.findIndex(
        (call) => call.args[0] === '/*'
      );

      expect(baseRouteIndex).to.be.lessThan(wildcardRouteIndex);
    });

    it('should apply /application before /application/storage in configuration', () => {
      const mockApp = {
        use: sinon.stub(),
      };

      routerModule(mockApp);

      const calls = mockApp.use.getCalls();
      const applicationIndex = calls.findIndex(
        (call) => call.args[0] === '/application'
      );
      const storageIndex = calls.findIndex(
        (call) => call.args[0] === '/application/storage'
      );

      // In the implementation, /application is registered first,
      // then /application/storage (Express handles specificity at routing time)
      expect(applicationIndex).to.be.lessThan(storageIndex);
    });
  });
});
