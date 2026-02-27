import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  parsing_generic_tags,
  parsingK8SObjects,
  attribute_state,
} from '../../src/utils/parsing.util.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.util.js';

chai.use(sinonChai);

describe('parsing_generic_tags()', () => {
  it('should return original value when custom_values is undefined', () => {
    const value = 'Test <hash> and <username>';

    const result = parsing_generic_tags(value, undefined);

    chai.expect(result).to.equal(value);
  });

  it('should replace <hash> tag with actual hash', () => {
    const value = 'Application hash: <hash>';
    const custom_values = {
      username: 'john',
      label: 'dev',
      password: 'pass123',
      hash: 'abc123',
      generated_label: 'test-app',
      web_title: 'My App',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.include('abc123');
    chai.expect(result).not.to.include('<hash>');
  });

  it('should replace <username> tag with actual username', () => {
    const value = 'User: <username>';
    const custom_values = {
      username: 'john_doe',
      label: 'dev',
      password: 'pass123',
      hash: 'abc123',
      generated_label: 'test-app',
      web_title: 'My App',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('User: john_doe');
  });

  it('should replace <password> tag with actual password', () => {
    const value = 'Password: <password>';
    const custom_values = {
      username: 'user',
      label: 'dev',
      password: 'secret123',
      hash: 'abc123',
      generated_label: 'test-app',
      web_title: 'My App',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('Password: secret123');
  });

  it('should replace <generated_label> tag', () => {
    const value = 'Label: <generated_label>';
    const custom_values = {
      username: 'user',
      label: 'prod',
      password: 'pass',
      hash: 'xyz789',
      generated_label: 'app-label-001',
      web_title: 'My App',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('Label: app-label-001');
  });

  it('should replace <target> tag with empty string by default', () => {
    const value = 'Target: <target>';
    const custom_values = {
      username: 'user',
      label: 'dev',
      password: 'pass',
      hash: 'abc',
      generated_label: 'label',
      web_title: 'App',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('Target: ');
  });

  it('should replace <target> tag with provided value', () => {
    const value = 'Target: <target>';
    const custom_values = {
      username: 'user',
      label: 'dev',
      password: 'pass',
      hash: 'abc',
      generated_label: 'label',
      web_title: 'App',
      target: '/console',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('Target: /console');
  });

  it('should replace <subpath> with dynamic value', () => {
    const value = 'Path: <subpath>';
    const custom_values = {
      username: 'user',
      label: 'dev',
      password: 'pass',
      hash: 'abc123',
      generated_label: 'label',
      web_title: 'App',
      target: '',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('Path: /abc123/dev');
  });

  it('should include -terminal in subpath when target is provided', () => {
    const value = 'Path: <subpath>';
    const custom_values = {
      username: 'user',
      label: 'prod',
      password: 'pass',
      hash: 'xyz789',
      generated_label: 'label',
      web_title: 'App',
      target: 'terminal',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('Path: /xyz789/prod-terminal');
  });

  it('should replace <vm_name> tag with web_title', () => {
    const value = 'VM: <vm_name>';
    const custom_values = {
      username: 'user',
      label: 'dev',
      password: 'pass',
      hash: 'abc123',
      generated_label: 'label',
      web_title: 'production-server',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('VM: production-server');
  });

  it('should replace multiple tags in single string', () => {
    const value = 'User <username> on <vm_name> with hash <hash>';
    const custom_values = {
      username: 'alice',
      label: 'test',
      password: 'pwd',
      hash: 'def456',
      generated_label: 'app',
      web_title: 'server-01',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('User alice on server-01 with hash def456');
  });

  it('should throw MissingArgumentError when username is missing', () => {
    const value = 'Test <username>';
    const custom_values = {
      label: 'dev',
      password: 'pass',
      hash: 'abc123',
      generated_label: 'label',
      web_title: 'App',
    };

    try {
      parsing_generic_tags(value, custom_values);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });

  it('should throw MissingArgumentError when label is missing', () => {
    const value = 'Test';
    const custom_values = {
      username: 'user',
      password: 'pass',
      hash: 'abc123',
      generated_label: 'label',
      web_title: 'App',
    };

    try {
      parsing_generic_tags(value, custom_values);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });

  it('should throw ParameterMisformed when username is too short', () => {
    const value = 'Test';
    const custom_values = {
      username: 'a',
      label: 'dev',
      password: 'pass',
      hash: 'abc123',
      generated_label: 'label',
      web_title: 'App',
    };

    try {
      parsing_generic_tags(value, custom_values);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });

  it('should handle empty value string', () => {
    const value = '';
    const custom_values = {
      username: 'user',
      label: 'dev',
      password: 'pass',
      hash: 'abc123',
      generated_label: 'label',
      web_title: 'App',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('');
  });

  it('should handle value with no tags', () => {
    const value = 'Plain text without tags';
    const custom_values = {
      username: 'user',
      label: 'dev',
      password: 'pass',
      hash: 'abc123',
      generated_label: 'label',
      web_title: 'App',
    };

    const result = parsing_generic_tags(value, custom_values);

    chai.expect(result).to.equal('Plain text without tags');
  });
});

describe('attribute_state()', () => {
  it('should return Ready for Service kind', () => {
    const item = {
      kind: 'Service',
      metadata: {},
      spec: {},
      status: {},
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Ready');
  });

  it('should return Ready for Pod with Running phase', () => {
    const item = {
      kind: 'Pod',
      metadata: {},
      spec: {},
      status: { phase: 'Running' },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Ready');
  });

  it('should return Ready for PVC with Bound phase', () => {
    const item = {
      kind: 'PersistentVolumeClaim',
      metadata: {},
      spec: {},
      status: { phase: 'Bound' },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Ready');
  });

  it('should return Error for Pod with Failed phase', () => {
    const item = {
      kind: 'Pod',
      metadata: {},
      spec: {},
      status: { phase: 'Failed' },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Error');
  });

  it('should return Error for Pod with CrashLoopBackOff phase', () => {
    const item = {
      kind: 'Pod',
      metadata: {},
      spec: {},
      status: { phase: 'CrashLoopBackOff' },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Error');
  });

  it('should return Deleted for PersistentVolume with Released phase', () => {
    const item = {
      kind: 'PersistentVolume',
      metadata: {},
      spec: {},
      status: { phase: 'Released' },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Deleted');
  });

  it('should return Getting ready for Pod with Pending phase', () => {
    const item = {
      kind: 'Pod',
      metadata: {},
      spec: {},
      status: { phase: 'Pending' },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Getting ready');
  });

  it('should return Off for Pod with Terminating phase', () => {
    const item = {
      kind: 'Pod',
      metadata: {},
      spec: {},
      status: { phase: 'Terminating' },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Off');
  });

  it('should return Off for ReplicaSet with zero desired replicas', () => {
    const item = {
      kind: 'ReplicaSet',
      metadata: {
        annotations: {
          'deployment.kubernetes.io/desired-replicas': '0',
        },
      },
      spec: { replicas: 0 },
      status: { readyReplicas: 0 },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Off');
  });

  it('should return Ready for ReplicaSet with matching replicas', () => {
    const item = {
      kind: 'ReplicaSet',
      metadata: {
        annotations: {
          'deployment.kubernetes.io/desired-replicas': '3',
        },
      },
      spec: { replicas: 3 },
      status: { readyReplicas: 3 },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Ready');
  });

  it('should return Getting ready for ReplicaSet with mismatched replicas', () => {
    const item = {
      kind: 'ReplicaSet',
      metadata: {
        annotations: {
          'deployment.kubernetes.io/desired-replicas': '3',
        },
      },
      spec: { replicas: 3 },
      status: { readyReplicas: 2 },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Getting ready');
  });

  it('should return Ready for Deployment with all replicas ready', () => {
    const item = {
      kind: 'Deployment',
      metadata: {},
      spec: {},
      status: {
        readyReplicas: 2,
        availableReplicas: 2,
        unavailableReplicas: undefined,
      },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Ready');
  });

  it('should return Getting ready for Deployment with unavailable replicas', () => {
    const item = {
      kind: 'Deployment',
      metadata: {},
      spec: {},
      status: {
        readyReplicas: undefined,
        availableReplicas: 1,
        unavailableReplicas: 1,
      },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Getting ready');
  });

  it('should return Getting ready for unknown kind', () => {
    const item = {
      kind: 'CustomResource',
      metadata: {},
      spec: {},
      status: {},
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Getting ready');
  });

  it('should return Getting ready for unknown phase', () => {
    const item = {
      kind: 'Pod',
      metadata: {},
      spec: {},
      status: { phase: 'UnknownPhase' },
    };

    const result = attribute_state(item);

    chai.expect(result).to.equal('Getting ready');
  });
});

describe('parsingK8SObjects()', () => {
  it('should parse empty items array and return Getting ready state', () => {
    const props = {
      hash: 'abc123',
      items: [],
    };
    const result = JSON.parse(parsingK8SObjects(props));

    chai.expect(result.sender).to.equal('ms-state');
    chai.expect(result.hash).to.equal('abc123');
    chai.expect(result.state).to.equal('Getting ready');
  });

  it('should return Ready when all items are Ready', () => {
    const props = {
      hash: 'xyz789',
      items: [
        {
          kind: 'Service',
          metadata: '{}',
          spec: '{}',
          status: '{}',
        },
        {
          kind: 'Service',
          metadata: {},
          spec: {},
          status: {},
        },
      ],
    };

    const result = JSON.parse(parsingK8SObjects(props));

    chai.expect(result.state).to.equal('Ready');
  });

  it('should return Error when any item has Error state', () => {
    const mockGetState = sinon.stub();
    mockGetState.withArgs(sinon.match({ kind: 'Pod' })).returns('Error');
    mockGetState.withArgs(sinon.match({ kind: 'Service' })).returns('Ready');

    const props = {
      hash: 'err001',
      items: [
        {
          kind: 'Service',
          metadata: '{}',
          spec: '{}',
          status: '{}',
        },
        {
          kind: 'Pod',
          metadata: '{"phase":"Failed"}',
          spec: '{}',
          status: '{"phase":"Failed"}',
        },
      ],
    };

    const result = JSON.parse(
      parsingK8SObjects(props, { get_state: mockGetState })
    );

    chai.expect(result.state).to.equal('Error');
  });

  it('should return Deleted when any item has Deleted state', () => {
    const mockGetState = sinon.stub();
    mockGetState.returns('Deleted');

    const props = {
      hash: 'del001',
      items: [
        {
          kind: 'PersistentVolume',
          metadata: '{}',
          spec: '{}',
          status: '{}',
        },
      ],
    };

    const result = JSON.parse(
      parsingK8SObjects(props, { get_state: mockGetState })
    );

    chai.expect(result.state).to.equal('Deleted');
  });

  it('should return Off when any item has Off state', () => {
    const mockGetState = sinon.stub();
    mockGetState.returns('Off');

    const props = {
      hash: 'off001',
      items: [
        {
          kind: 'Pod',
          metadata: '{}',
          spec: '{}',
          status: '{}',
        },
      ],
    };

    const result = JSON.parse(
      parsingK8SObjects(props, { get_state: mockGetState })
    );

    chai.expect(result.state).to.equal('Off');
  });

  it('should return Getting ready when any item has Getting ready state', () => {
    const mockGetState = sinon.stub();
    mockGetState.withArgs(sinon.match({ kind: 'Service' })).returns('Ready');
    mockGetState
      .withArgs(sinon.match({ kind: 'Pod' }))
      .returns('Getting ready');

    const props = {
      hash: 'grd001',
      items: [
        {
          kind: 'Service',
          metadata: '{}',
          spec: '{}',
          status: '{}',
        },
        {
          kind: 'Pod',
          metadata: '{}',
          spec: '{}',
          status: '{}',
        },
      ],
    };

    const result = JSON.parse(
      parsingK8SObjects(props, { get_state: mockGetState })
    );

    chai.expect(result.state).to.equal('Getting ready');
  });

  it('should parse JSON strings for metadata, spec, and status', () => {
    const props = {
      hash: 'prs001',
      items: [
        {
          kind: 'Pod',
          metadata: '{"name":"test-pod"}',
          spec: '{"containers":[]}',
          status: '{"phase":"Running"}',
        },
      ],
    };

    const result = JSON.parse(parsingK8SObjects(props));

    chai.expect(result.sender).to.equal('ms-state');
    chai.expect(result.hash).to.equal('prs001');
  });

  it('should handle mixed JSON string and object formats', () => {
    const props = {
      hash: 'mxd001',
      items: [
        {
          kind: 'Service',
          metadata: { name: 'svc' },
          spec: '{"type":"ClusterIP"}',
          status: { ready: true },
        },
      ],
    };

    const result = JSON.parse(parsingK8SObjects(props));

    chai.expect(result.sender).to.equal('ms-state');
    chai.expect(result.hash).to.equal('mxd001');
  });

  it('should default items array to empty when not provided', () => {
    const props = {
      hash: 'dft001',
    };

    const result = JSON.parse(parsingK8SObjects(props));

    chai.expect(result.state).to.equal('Getting ready');
  });

  it('should throw MissingArgumentError when hash is missing', () => {
    const props = {
      items: [],
    };

    try {
      parsingK8SObjects(props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });

  it('should throw ParameterMisformed when hash is too short', () => {
    const props = {
      hash: 'abc',
      items: [],
    };

    try {
      parsingK8SObjects(props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });

  it('should throw ParameterMisformed when hash is too long', () => {
    const props = {
      hash: 'abcdefghij',
      items: [],
    };

    try {
      parsingK8SObjects(props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });

  it('should throw ParameterMisformed when items is not an array', () => {
    const props = {
      hash: 'abc123',
      items: 'not-an-array',
    };

    try {
      parsingK8SObjects(props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });

  it('should return valid JSON string', () => {
    const props = {
      hash: 'valid1',
      items: [],
    };

    const result = parsingK8SObjects(props);

    chai.expect(() => JSON.parse(result)).not.to.throw();
  });

  it('should handle multiple items with different states and return priority state', () => {
    const mockGetState = sinon.stub();
    mockGetState.onFirstCall().returns('Ready');
    mockGetState.onSecondCall().returns('Getting ready');
    mockGetState.onThirdCall().returns('Off');

    const props = {
      hash: 'pri001',
      items: [
        {
          kind: 'Service',
          metadata: '{}',
          spec: '{}',
          status: '{}',
        },
        {
          kind: 'Pod',
          metadata: '{}',
          spec: '{}',
          status: '{}',
        },
        {
          kind: 'Pod',
          metadata: '{}',
          spec: '{}',
          status: '{}',
        },
      ],
    };

    const result = JSON.parse(
      parsingK8SObjects(props, { get_state: mockGetState })
    );

    chai.expect(result.state).to.equal('Off');
  });
});

describe('parsingK8SObjects() Integration', () => {
  it('should correctly handle real K8S response structure', () => {
    const props = {
      hash: 'k8s001',
      items: [
        {
          kind: 'Pod',
          metadata: JSON.stringify({
            name: 'app-pod-1',
            namespace: 'default',
          }),
          spec: JSON.stringify({
            containers: [{ name: 'app', image: 'app:latest' }],
          }),
          status: JSON.stringify({ phase: 'Running' }),
        },
        {
          kind: 'Service',
          metadata: JSON.stringify({
            name: 'app-svc',
          }),
          spec: JSON.stringify({
            selector: { app: 'myapp' },
          }),
          status: '{}',
        },
      ],
    };

    const result = JSON.parse(parsingK8SObjects(props));

    chai.expect(result.sender).to.equal('ms-state');
    chai.expect(result.hash).to.equal('k8s001');
    chai.expect(result.state).to.equal('Ready');
  });
});
