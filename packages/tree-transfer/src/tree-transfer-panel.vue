<template>
  <div class="el-tree-transfer-panel">
    <p class="el-transfer-panel__header">
      <el-checkbox
          ref="searchInput"
          v-model="allChecked"
          @change="handleAllCheckedChange"
          :indeterminate="isIndeterminate">
        {{ title }}
        <span>{{ checkedSummary }}</span>
      </el-checkbox>
    </p>
    <div :class="['el-transfer-panel__body', hasFooter ? 'is-with-footer' : '']">
      <el-input
          class="el-transfer-panel__filter"
          v-model="query"
          size="small"
          :placeholder="placeholder"
          @mouseenter.native="inputHover = true"
          @mouseleave.native="inputHover = false"
          v-if="filterable">
        <i slot="prefix"
           :class="['el-input__icon', 'el-icon-' + inputIcon]"
           @click="clearQuery"
        ></i>
      </el-input>
      <el-tree
          ref="itemTree"
          :data="filteredData"
          show-checkbox
          :props="treeProps"
          :node-key="nodeKey"
          @check-change="checkChange"
          @check="check"
          @current-change="currentChange"
          :default-checked-keys="defaultChecked"
          :default-expand-all="defaultExpandAll"
      ></el-tree>
      <p
          class="el-transfer-panel__empty"
          v-show="hasNoMatch">{{ t('el.transfer.noMatch') }}</p>
      <p
          class="el-transfer-panel__empty"
          v-show="data.length === 0 && !hasNoMatch">{{ t('el.transfer.noData') }}</p>
    </div>
    <p class="el-transfer-panel__footer" v-if="hasFooter">
      <slot></slot>
    </p>
  </div>
</template>

<script>
import ElCheckboxGroup from 'element-ui/packages/checkbox-group';
import ElCheckbox from 'element-ui/packages/checkbox';
import ElInput from 'element-ui/packages/input';
import Locale from 'element-ui/src/mixins/locale';
import ElTree from 'element-ui/packages/tree';

export default {
  mixins: [Locale],

  name: 'ElTreeTransferPanel',

  componentName: 'ElTreeTransferPanel',

  components: {
    ElCheckboxGroup,
    ElCheckbox,
    ElInput,
    ElTree
  },

  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    }, // 页面数据
    placeholder: String, // 展示提示文字
    title: String, // 页面标题
    filterable: Boolean, // 是否可筛选
    format: Object, // 格式化
    filterMethod: Function, // 过滤方法
    defaultChecked: {
      type: Array,
      default() {
        return [];
      }
    }, // 默认勾选的节点
    treeProps: {
      type: Object,
      default() {
        return {label: 'label', children: 'children' };
      }
    }, // 树图展示属性
    nodeKey: { type: String, default: 'id' }, // 节点主键
    defaultExpandAll: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      checked: [],
      allChecked: false,
      query: '',
      inputHover: false,
      checkChangeByUser: true
    };
  },

  watch: {
    checked(val, oldVal) {
      this.$refs.itemTree.setCheckedKeys(val);
      /*   val = this.$refs.itemTree.getCheckedNodes();
         this.updateAllChecked();
         if (this.checkChangeByUser) {
           const movedKeys = val.concat(oldVal)
             .filter(v => val.indexOf(v) === -1 || oldVal.indexOf(v) === -1);
           this.$emit('checked-change', val, movedKeys);
         } else {
           this.$emit('checked-change', val);
           this.checkChangeByUser = true;
         }*/
    },

    data() {
      const checked = [];
      const filteredDataKeys = this.filteredData.map(item => item[this.keyProp]);
      this.checked.forEach(item => {
        if (filteredDataKeys.indexOf(item) > -1) {
          checked.push(item);
        }
      });
      this.checkChangeByUser = false;
      this.checked = checked;
    },

    checkableData() {
      this.updateAllChecked();
    },
    /**
     * 监听默认勾选数据事件
     */
    defaultChecked: {
      immediate: true,
      handler(val, oldVal) {
        if (oldVal && val.length === oldVal.length &&
            val.every(item => oldVal.indexOf(item) > -1)) return;
        const checked = [];
        const checkableDataKeys = this.checkableData.map(item => item[this.keyProp]);
        val.forEach(item => {
          if (checkableDataKeys.indexOf(item) > -1) {
            checked.push(item);
          }
        });
        this.checkChangeByUser = false;
        this.checked = checked;
      }
    }
  },

  computed: {
    filteredData: function() {
      // 过滤符合条件的数据
      var newData = null;
      if (this.data instanceof Array) {
        newData = [...this.data];
      } else {
        newData = {...this.data};
      }
      if (typeof this.filterMethod === 'function') {
        return this.filterMethod(this.query, newData);
      } else {
        this.HandlerFilteredData(newData, this.query);
      }
      return this.query === '' ? this.data : newData;
    },

    checkableData() {
      return this.data; // this.filteredData.filter(item => !item[this.disabledProp]);
    },

    checkedSummary() {
      const checkedLength = this.checked.length;
      var countLeafNodes = this.collectAllNodesSafe(this.data);
      const dataLength = countLeafNodes.length;
      const {noChecked, hasChecked} = this.format;
      if (noChecked && hasChecked) {
        return checkedLength > 0 ? hasChecked.replace(/\${checked}/g, checkedLength).replace(/\${total}/g, dataLength) : noChecked.replace(/\${total}/g, dataLength);
      } else {
        return `${checkedLength}/${dataLength}`;
      }
    },

    isIndeterminate() {
      const checkedLength = this.checked.length;
      return checkedLength > 0 && checkedLength < this.checkableData.length;
    },

    hasNoMatch() {
      return this.query.length > 0 && this.filteredData.length === 0;
    },

    inputIcon() {
      return this.query.length > 0 && this.inputHover ? 'circle-close' : 'search';
    },

    labelProp() {
      return this.treeProps.label || 'label';
    },
    childrenProp() {
      return this.treeProps.children || 'children';
    },
    disabledProp() {
      return this.treeProps.disabled || 'disabled';
    },

    hasFooter() {
      return !!this.$slots.default;
    }
  },

  methods: {
    HandlerFilteredData: function(treeData, condition) {
      if (treeData instanceof Array) {
        let length = treeData.length;
        var notExistsCount = 0;
        var existsCount = 0;
        for (let i = 0; i < length;) {
          var treeItem = {...treeData[i]};
          treeData[i] = treeItem;// 深度拷贝
          if (treeItem.hasOwnProperty(this.childrenProp) && treeItem[this.childrenProp].length > 0) {
            let newVar = [...treeItem[this.childrenProp]];
            this.HandlerFilteredData(newVar, condition);
            treeItem[this.childrenProp] = newVar;
          }
          const label = treeItem[this.labelProp];
          if (label.toLowerCase().indexOf(condition.toLowerCase()) > -1) {
            existsCount++;
            i++;
          } else {
            if (!treeItem.hasOwnProperty(this.childrenProp) || treeItem[this.childrenProp].length === 0) {
              treeData.splice(i, 1);
              notExistsCount++;
            } else {
              i++;
            }
          }
          if (notExistsCount + existsCount === length || typeof (treeData[i]) === 'undefined') {
            break;
          }
        }
        return;
      }

    },
    updateAllChecked() {
      const checkableDataKeys = this.checkableData.map(item => item[this.keyProp]);
      this.allChecked = checkableDataKeys.length > 0 &&
          checkableDataKeys.every(item => this.checked.indexOf(item) > -1);
    },

    handleAllCheckedChange(value) {
      this.checked = value ? this.checkableData.map(item => item[this.keyProp]) : [];
    },

    clearQuery() {
      if (this.inputIcon === 'circle-close') {
        this.query = '';
      }
    },

    /**
     * 节点改变事件
     * @param node 当前节点
     * @param selfCheck  节点本身是否被勾选
     * @param childrenHasCheck  节点孩子是否有被勾选
     */
    checkChange: function(node, selfCheck, childrenHasCheck) {
      var val = this.$refs.itemTree.getCheckedKeys();
      if (this.filterable && this.query !== '') {
        for (var valElement of val) {
          if (!this.$refs.itemTree.getNode(valElement).isLeaf) {
            val.splice(val.indexOf(valElement), 1);
          }
        }
      }
      this.$refs.itemTree.setCheckedKeys(val);
      //  this.updateAllChecked();
      if (this.checkChangeByUser) {
        /*      const movedKeys = val.concat(oldVal)
                .filter(v => val.indexOf(v) === -1 || oldVal.indexOf(v) === -1);*/
        this.$emit('checked-change', val);
      } else {
        this.$emit('checked-change', val);
        this.checkChangeByUser = true;
      }
      this.checked = val;
    },
    /**
     *  当复选框被点击的时候触发
     * @param checkNode  当前节点
     * @param treeNode   树目前的选中状态对象   包含   checkedNodes,checkedKeys,halfCheckedNodes,halfCheckedKeys
     */
    check: function(checkNode, treeNode) {

    },
    /**
     * 当前选中节点变化时触发的事件
     * 当前节点的数据，当前节点的 Node 对象
     */
    currentChange: function(node, treeNode) {

    },
    collectAllNodesSafe: function(treeData, childrenKey = 'children') {
      const allNodes = [];
      const stack = [];
      let i = treeData.length;

      //  初始填充栈（反向以便按顺序弹出）
      while (i--) {
        stack.push(treeData[i]);
      }

      while (stack.length) {
        const node = stack.pop();
        allNodes.push(node);

        if (node[childrenKey] && node[childrenKey].length > 0) {
          let j = node[childrenKey].length;
          while (j--) {
            stack.push(node[childrenKey][j]);
          }
        }
      }
      return allNodes;
    }
  }
};
</script>
