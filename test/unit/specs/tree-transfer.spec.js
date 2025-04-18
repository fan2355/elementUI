import { createTest, createVue, destroyVM } from '../util';
import TreeTransfer from 'packages/tree-transfer';

describe('TreeTransfer', () => {
  let vm;
  const getTestData = () => {
    const data = [];
    for (let i = 1; i <= 15; i++) {
      data.push({
        key: i,
        label: `备选项 ${ i }`,
        disabled: i % 4 === 0
      });
    }
    return data;
  };
  const createTreeTransfer = (props, opts) => {
    return createVue(Object.assign({
      template: `
        <el-transfer :data="testData" ref="treeTransfer" ${props}>
        </el-transfer>
      `,

      created() {
        this.testData = getTestData();
      }
    }, opts));
  };

  afterEach(() => {
    destroyVM(vm);
  });

  it('create', () => {
    vm = createTest(TreeTransfer, true);
    expect(vm.$el).to.exist;
  });

  it('default target list', () => {
    vm = createTreeTransfer('v-model="value"', {
      data() {
        return {
          value: [1, 4]
        };
      }
    });
    expect(vm.$refs.treeTransfer.sourceData.length).to.equal(13);
  });

  it('filterable', done => {
    vm = createTreeTransfer('v-model="value" filterable :filter-method="method"', {
      data() {
        return {
          value: [],
          method(query, option) {
            return option.key === Number(query);
          }
        };
      }
    });
    const transfer = vm.$refs.treeTransfer;
    const leftList = transfer.$el.querySelector('.el-tree-transfer-panel').__vue__;
    leftList.query = '1';
    setTimeout(_ => {
      expect(leftList.filteredData.length).to.equal(1);
      done();
    }, 50);
  });

  it('transfer', done => {
    vm = createTreeTransfer('v-model="value" :left-default-checked="[2, 3]" :right-default-checked="[1]"', {
      data() {
        return {
          value: [1, 4]
        };
      }
    });
    const transfer = vm.$refs.treeTransfer;

    setTimeout(_ => {
      transfer.addToLeft();
      setTimeout(_ => {
        expect(transfer.sourceData.length).to.equal(14);
        transfer.addToRight();
        setTimeout(_ => {
          expect(transfer.sourceData.length).to.equal(12);
          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('customize', () => {
    vm = createTreeTransfer('v-model="value" :titles="titles" :render-content="renderFunc" :format="format"', {
      data() {
        return {
          value: [2],
          titles: ['表1', '表2'],
          format: { noChecked: 'no', hasChecked: 'has' },
          renderFunc(h, option) {
            return <span>{ option.key } - { option.label }</span>;
          }
        };
      }
    });
    const transfer = vm.$refs.treeTransfer.$el;
    const label = transfer.querySelector('.el-transfer-panel__header .el-checkbox__label');
    expect(label.innerText.indexOf('表1') > -1).to.true;
    expect(transfer.querySelector('.el-transfer-panel__list .el-checkbox__label span').innerText).to.equal('1 - 备选项 1');
    expect(label.querySelector('span').innerText).to.equal('no');
  });

  it('check', () => {
    vm = createTreeTransfer('v-model="value"', {
      data() {
        return {
          value: []
        };
      }
    });
    const leftList = vm.$refs.treeTransfer.$el.querySelector('.el-tree-transfer-panel').__vue__;
    leftList.handleAllCheckedChange({ target: { checked: true } });
    expect(leftList.checked.length).to.equal(12);
  });

  describe('target order', () => {
    it('original(default)', done => {
      vm = createTreeTransfer('v-model="value" :left-default-checked="[2, 3]"', {
        data() {
          return {
            value: [1, 4]
          };
        }
      });
      const transfer = vm.$refs.treeTransfer;
      setTimeout(() => {
        transfer.addToRight();
        setTimeout(() => {
          const targetItems = [].slice.call(vm.$el.querySelectorAll('.el-transfer__buttons + .el-tree-transfer-panel .el-transfer-panel__body .el-checkbox__label span'));
          expect(targetItems.map(item => item.innerText)).to.deep.equal(['备选项 1', '备选项 2', '备选项 3', '备选项 4']);
          done();
        }, 50);
      }, 50);
    });

    it('push', done => {
      vm = createTreeTransfer('v-model="value" :left-default-checked="[2, 3]" target-order="push"', {
        data() {
          return {
            value: [1, 4]
          };
        }
      });
      const transfer = vm.$refs.treeTransfer;
      setTimeout(() => {
        transfer.addToRight();
        setTimeout(() => {
          const targetItems = [].slice.call(vm.$el.querySelectorAll('.el-transfer__buttons + .el-tree-transfer-panel .el-transfer-panel__body .el-checkbox__label span'));
          expect(targetItems.map(item => item.innerText)).to.deep.equal(['备选项 1', '备选项 4', '备选项 2', '备选项 3']);
          done();
        }, 50);
      }, 50);
    });

    it('unshift', done => {
      vm = createTreeTransfer('v-model="value" :left-default-checked="[2, 3]" target-order="unshift"', {
        data() {
          return {
            value: [1, 4]
          };
        }
      });
      const transfer = vm.$refs.treeTransfer;
      setTimeout(() => {
        transfer.addToRight();
        setTimeout(() => {
          const targetItems = [].slice.call(vm.$el.querySelectorAll('.el-transfer__buttons + .el-tree-transfer-panel .el-transfer-panel__body .el-checkbox__label span'));
          expect(targetItems.map(item => item.innerText)).to.deep.equal(['备选项 2', '备选项 3', '备选项 1', '备选项 4']);
          done();
        }, 50);
      }, 50);
    });
  });
});
