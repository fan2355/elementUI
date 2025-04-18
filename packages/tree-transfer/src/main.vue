<template>
  <div class="el-tree-transfer">
      <el-tree-transfer-panel
          ref="leftPanel"
          :data="leftPanelData"
          :title="titles[0] || '源列表'"
          :placeholder="filterPlaceholder || '请输入搜索内容'"
          :filterable="filterable"
          :filter-method="filterMethod"
          @checked-change="handleLeftCheckedChange"
          :tree-props="treeProps"
          :default-checked="leftDefaultChecked"
          :format="format"
          :node-key="nodeKey"
      >
      </el-tree-transfer-panel>
      <div class="el-transfer__buttons">
        <el-button
            type="primary"
            :class="['el-transfer__button', { 'is-disabled': rightChecked.length === 0 }]"
            :disabled="rightChecked.length === 0"
            @click="moveToLeft"
        >
          <i class="el-icon-arrow-left"></i>
        </el-button>
        <el-button
            type="primary"
            :class="['el-transfer__button', { 'is-disabled': leftChecked.length === 0 }]"
            :disabled="leftChecked.length === 0"
            @click="moveToRight"
        >
          <i class="el-icon-arrow-right"></i>
        </el-button>
      </div>
      <el-tree-transfer-panel
          ref="rightPanel"
          :data="rightPanelData"
          :title="titles[1] || '目标列表'"
          :placeholder="filterPlaceholder || '请输入搜索内容'"
          :filterable="filterable"
          :filter-method="filterMethod"
          @checked-change="handleRightCheckedChange"
          :tree-props="treeProps"
          :default-checked="rightDefaultChecked"
          :format="format"
          :node-key="nodeKey"
      >
      </el-tree-transfer-panel>
    </div>
</template>

<script>
import ElTree from 'element-ui/packages/tree/src/tree.vue';
import ElButton from 'element-ui/packages/button/src/button.vue';
import ElTreeTransferPanel from './tree-transfer-panel.vue';

export default {
  name: 'ElTreeTransfer',
  components: {
    ElTreeTransferPanel,
    ElTree,
    ElButton
  },
  props: {
    leftData: {
      type: Array,
      default() {
        return [];
      }
    },
    rightData: {
      type: Array,
      default() {
        return [];
      }
    },
    titles: {
      type: Array,
      default() {
        return [];
      }
    },
    filterPlaceholder: {
      type: String,
      default: ''
    },
    filterable: {
      type: Boolean,
      default: false
    },
    filterMethod: {
      type: Function,
      default: null
    },
    treeProps: {
      type: Object,
      default() {
        return {
          key: 'id',
          children: 'children',
          label: 'label',
          disabled: 'disabled'
        };
      }
    },
    nodeKey: {
      type: String,
      default: 'id'
    },
    leftDefaultChecked: {
      type: Array,
      default() {
        return [];
      }
    },
    rightDefaultChecked: {
      type: Array,
      default() {
        return [];
      }
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    expandOnClickNode: {
      type: Boolean,
      default: true
    },
    format: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      leftPanelData: this.leftData,
      rightPanelData: this.rightData,
      leftChecked: [],
      rightChecked: []
    };
  },
  watch: {

  },
  methods: {
    /*  updateData() {
        const {data, value, nodeKey} = this;

        if (!data || data.length === 0) {
          this.leftData = [];
          this.rightData = [];
          return;
        }

        //  深拷贝源数据
        const sourceData = JSON.parse(JSON.stringify(data));

        //  找出已选中的节点
        const selectedKeys = new Set(value);

        //  分离左右数据
        const separateData = (nodes) => {
          const leftNodes = [];
          const rightNodes = [];

          nodes.forEach(node => {
            const isSelected = selectedKeys.has(node[nodeKey]);
            const newNode = {...node};

            if (newNode.children) {
              const {left, right} = separateData(newNode.children);
              newNode.children = left;

              if (right.length > 0) {
                rightNodes.push({
                  ...newNode,
                  children: right
                });
              } else if (isSelected) {
                rightNodes.push(newNode);
              } else {
                leftNodes.push(newNode);
              }
            } else {
              if (isSelected) {
                rightNodes.push(newNode);
              } else {
                leftNodes.push(newNode);
              }
            }
          });

          return {left: leftNodes, right: rightNodes};
        };

        const {left, right} = separateData(sourceData);
        this.leftData = left;
        this.rightData = right;
      },*/
    /**
     * 获取左侧树图数据
     * @returns {default.leftData}
     */
    getLeftPanelData: function() {
      return this.leftPanelData;
    },
    /**
     * 获取右侧树图数据
     * @returns {default.rightData}
     */
    getRightPanelData: function() {
      return this.rightPanelData;
    },
    handleLeftTreeCheck(node, checkedNodes) {
      const checkedKeys = checkedNodes.checkedKeys || [];
      this.leftChecked = checkedKeys;
      //  this.$refs.leftPanel.updateCheckedState(checkedKeys);
    },

    handleRightTreeCheck(node, checkedNodes) {
      const checkedKeys = checkedNodes.checkedKeys || [];
      this.rightChecked = checkedKeys;
      // this.$refs.rightPanel.updateCheckedState(checkedKeys);
    },

    handleLeftCheckedChange(checked) {
      this.leftChecked = checked;
      this.$refs.leftPanel.leftDefaultChecked = checked;
    },

    handleRightCheckedChange(checked) {
      this.rightChecked = checked;
      this.$refs.rightPanel.rightDefaultChecked = checked;
    },
    /**
     * @description 移动至右框
     */
    moveToRight: function() {
      if (this.leftChecked.length === 0) return;
      var leftTreeData = [...this.leftPanelData];
      var rightTreeData = [...this.rightPanelData];
      for (var i = 0; i < this.leftChecked.length; i++) {
        /*    if (this.filterable&&this.$refs.leftPanel.query) {
              var node = this.$refs.leftPanel.$refs.itemTree.getNode(this.leftChecked[i]);
              if (!node.isLeaf) {
                continue;
              }
            }*/
        // 找到的节点数据
        var foundNode = this.findNodeInTree(this.leftPanelData, node => node.id === this.leftChecked[i]);
        leftTreeData = this.removeNodes([...this.leftPanelData], this.leftChecked);
        rightTreeData = this.ArrayMerge(rightTreeData, foundNode);
        // 通知父页面是否修改对应的值
      }
      //  获取选中节点及其所有子节点

      //  更新数据
      this.leftPanelData = leftTreeData;
      this.rightPanelData = rightTreeData;
      //  清空选中状态
      this.leftChecked = [];
      this.$refs.leftPanel.leftDefaultChecked = [];
      this.$refs.leftPanel.$refs.itemTree.setCheckedKeys([]);
      // this.$refs.leftPanel.updateCheckedState([]);
      this.$emit('change', leftTreeData, rightTreeData);
    },
    /**
     *  @description  移动至左框
     */
    moveToLeft() {
      if (this.rightChecked.length === 0) return;
      var leftTreeData = [...this.leftPanelData];
      var rightTreeData = [...this.rightPanelData];
      for (var i = 0; i < this.rightChecked.length; i++) {
        // 找到的节点数据
        var foundNode = this.findNodeInTree(this.rightPanelData, node => node.id === this.rightChecked[i]);
        rightTreeData = this.removeNodes([...this.rightPanelData], this.rightChecked);
        leftTreeData = this.ArrayMerge(leftTreeData, foundNode);
      }
      //  更新数据
      this.leftPanelData = leftTreeData;
      this.rightPanelData = rightTreeData;
      //  清空选中状态
      this.rightChecked = [];
      this.$refs.rightPanel.rightDefaultChecked = [];
      this.$refs.rightPanel.$refs.itemTree.setCheckedKeys([]);
      this.$emit('change', leftTreeData, rightTreeData);

    },

    getAllCheckedKeys(treeData, checkedKeys) {
      const allKeys = new Set();
      allKeys.add(checkedKeys);
      const findChildren = (nodes) => {
        nodes.forEach((node, index) => {
          if (allKeys.has(node[this.nodeKey]) && node.children) {
            node.children.forEach(child => {
              allKeys.add(child[this.nodeKey]);
            });
          }
          if (node.children) {
            findChildren(node.children);
          }
        });
      };

      findChildren(treeData);
      return Array.from(allKeys);
    },

    addNodes(targetTree, sourceTree, keys) {
      const keySet = new Set(keys);
      const newTree = JSON.parse(JSON.stringify(targetTree));

      const findAndAdd = (sourceNodes) => {
        sourceNodes.forEach(node => {
          if (keySet.has(node[this.nodeKey])) {
            this.addNodeToTree(newTree, node);
          }
          if (node.children) {
            findAndAdd(node.children);
          }
        });
      };

      findAndAdd(sourceTree);
      return newTree;
    },

    addNodeToTree(tree, node) {
      //  检查是否已存在
      const exists = this.findNodeInTree(tree, node[this.nodeKey]);
      if (exists) return;

      //  添加节点
      const newNode = {...node, children: []};
      if (node.children) {
        newNode.children = node.children.map(child => ({...child}));
      }

      //  尝试找到父节点
      if (node.parentKey) {
        const parent = this.findNodeInTree(tree, node.parentKey);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(newNode);
          return;
        }
      }

      //  没有父节点则添加到根
      tree.push(newNode);
    },

    removeNodes: function(tree, keys) {
      var key = new Set(keys);
      const remove = (nodes) => {
        return nodes.filter(node => {
          let nodeElement = node[this.nodeKey];
          if (key.has(nodeElement)) {
            return false;
          }
          if (node.children) {
            node.children = remove(node.children);
          }
          return true;
        });
      };
      return remove(JSON.parse(JSON.stringify(tree)));
    },

    getSelectedKeys(tree) {
      const keys = [];

      const traverse = (nodes) => {
        nodes.forEach(node => {
          keys.push(node[this.nodeKey]);
          if (node.children) {
            traverse(node.children);
          }
        });
      };

      traverse(tree);
      return keys;
    },

    filterNodeMethod(value, data, node) {
      if (this.filterMethod) {
        return this.filterMethod(value, data, node);
      }
      const label = data[this.treeProps.label] || '';
      return label.includes(value);
    },

    /**
     * 以下为 树图节点查找相关方法
     */
    /**
     * 查找树形结构中符合条件的节点，并返回从根到该节点的路径树
     * @param {Array} tree 树形结构数组
     * @param {Function} predicate 判断节点是否匹配的函数
     * @param {Object} options 配置项
     * @param {String} options.childrenKey 子节点属性名，默认为'children'
     * @returns {Array} 包含匹配节点路径的新树形结构
     */
    findNodeInTree: function(tree, predicate, options = {}) {
      const {childrenKey = 'children'} = options;

      //  内部递归查找函数
      function _find(nodes, path) {
        for (const node of nodes) {
          //  创建当前节点的浅拷贝，避免修改原数据
          const newNode = {...node};
          const newPath = [...path, newNode];

          //  如果当前节点匹配，返回路径
          if (predicate(node)) {
            return newPath;
          }

          //  如果有子节点，递归查找
          if (node[childrenKey] && node[childrenKey].length > 0) {
            const foundPath = _find(node[childrenKey], newPath);
            if (foundPath) return foundPath;
          }
        }
        return null;
      }

      //  执行查找
      const path = _find(tree, []);
      if (!path) return [];

      //  构建结果树
      return this.buildTreeFromPath(path, childrenKey);
    },

    /**
     * 根据路径构建树形结构
     * @param {Array} path 节点路径数组
     * @param {String} childrenKey 子节点属性名
     * @returns {Array} 构建的树形结构
     */
    buildTreeFromPath: function(path, childrenKey) {
      if (path.length === 0) return [];

      //  从叶子节点开始构建
      let currentLevel = [];

      for (let i = path.length - 1; i >= 0; i--) {
        const node = path[i];
        //  创建节点副本，避免修改原数据
        const newNode = {...node};

        if (currentLevel.length > 0) {
          //  如果有下层节点，设置为当前节点的子节点
          newNode[childrenKey] = [...currentLevel];
        } else {
          //  叶子节点需要清空子节点
          delete newNode[childrenKey];
        }

        currentLevel = [newNode];
      }

      return currentLevel;
    },

    /**
     * 以下为树图数据合并方法
     */

    /**
     * 深度优先合并两个树形数据，保留所有节点
     *
     *    两个节点  属性必然需要一样    其孩子可能不一样，遍历双方的孩子
     *     node1 孩子1和node2 的所有孩子比较，是否一样 如果都不一样 则push
     *     然后用node2的孩子1  和node1 第二个孩子及以后的各个相比较  如果也都不同，则push node2的第一个孩子
     *            因为node1 孩子1和node2 的每一个孩子已经比较了 所以node2 的第一个孩子不需要在和node1的第一个孩子比较
     *     依次遍历完成 即 合并后的所有节点
     * @param {Object} node1 - 第一个树的当前节点
     * @param {Object} node2 - 第二个树的当前节点
     * @param {Function} mergeFn - 合并节点数据的函数
     * @param {string} childrenKey - 子节点属性名，默认为'children'
     * @return {Object} - 合并后的节点
     */
    mergeTreesDeep: function(node1, node2, childrenKey = 'children') {
      //  如果有一个节点不存在，返回另一个节点
      if (!node1) return JSON.parse(JSON.stringify(node2));
      if (!node2) return JSON.parse(JSON.stringify(node1));

      //  合并当前节点数据
      const mergedNode = node1;

      //  获取子节点
      const children1 = node1[childrenKey] || [];
      const children2 = node2[childrenKey] || [];

      //  递归合并子节点
      const maxLength = Math.max(children1.length, children2.length);
      mergedNode[childrenKey] = [];
      for (var i = 0; i < maxLength; i++) {
        const child1 = children1[i];
        const child2 = children2[i];
        if (typeof (child1) !== 'undefined' && typeof (child2) !== 'undefined') {
          var count = 0;// 统计每项不一样的个数
          for (var j = 0 ; j < children2.length ; j++) {
            if (child1.id === children2[j].id) {
              this.mergeTreesDeep(child1, children2[j], childrenKey);
            } else {
              count++;
            }
          }
          if (count === children2.length) {
            mergedNode[childrenKey].push(child1);
          }
          count = 0;
          for (var k = i + 1 ; k < children1.length ; k++) {
            if (child2.id === children1[k].id) {
              this.mergeTreesDeep(child2, children1[k], childrenKey);
            } else {
              count++;
            }
          }
          if (count === children1.length - i - 1) {
            mergedNode[childrenKey].push(child2);
          }
        }
        if (typeof (child1) === 'undefined') {
          mergedNode[childrenKey].push(child2);
        }
        if (typeof (child2) === 'undefined') {
          mergedNode[childrenKey].push(child1);
        }
      }
      return mergedNode;
    },
    //  简单合并函数
    simpleMerge: function(node1, node2) {
      return node1;
    },
    /**
     * 树图数组合并  --  里面的每个对象代表一个树图
     * @param treeArray1
     * @param treeArray2
     * @returns {*[]}
     * @constructor
     */
    ArrayMerge: function(treeArray1, treeArray2) {
      if (typeof treeArray1 === 'undefined') treeArray1 = [];
      if (typeof treeArray2 === 'undefined') treeArray2 = [];
      if (treeArray1.length === 0) return treeArray2;
      if (treeArray2.length === 0) return treeArray1;
      var treeArray1length = treeArray1.length;
      for (let i = 0; i < treeArray1length; i++) {
        for (var j = 0; j < treeArray2.length; j++) {
          if (treeArray2[j].id === treeArray1[i].id) {
            this.mergeTreesDeep(treeArray1[i], treeArray2[j]);
          } else {
            var found = this.findNodeInTree(treeArray1, node => node.id === treeArray2[j].id);
            if (found.length === 0) {
              treeArray1.push(treeArray2[j]);
            }
          }
        }
      }
      return treeArray1;
    }
  }
};
</script>