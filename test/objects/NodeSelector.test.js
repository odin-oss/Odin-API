import * as chai from 'chai';
import NodeSelector from '../../src/objects/NodeSelector.js';

describe('NodeSelector object', () => {
  it('creates with valid properties', () => {
    const selector = new NodeSelector({
      id_node_selector: '5',
      key: 'node.kubernetes.io/instance-type',
      value: 'large',
    });

    chai.expect(selector.id_node_selector).to.equal(5);
    chai.expect(selector.key).to.equal('node.kubernetes.io/instance-type');
    chai.expect(selector.value).to.equal('large');
  });

  it('throws on invalid id_node_selector', () => {
    chai
      .expect(() => {
        new NodeSelector({ id_node_selector: 0 });
      })
      .to.throw();
  });

  it('serializes to JSON', () => {
    const selector = new NodeSelector({
      id_node_selector: 1,
      key: 'kubernetes.io/hostname',
      value: 'node-1',
    });

    chai.expect(selector.toJSON()).to.deep.equal({
      id_node_selector: 1,
      key: 'kubernetes.io/hostname',
      value: 'node-1',
    });
  });
});
