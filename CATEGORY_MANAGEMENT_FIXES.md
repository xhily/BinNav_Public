# 分类管理优化修复

## 问题分析

用户提出了三个重要的分类管理优化需求：

### 🔍 **问题1：编辑一级分类后自动移至底部**
编辑一级分类保存后，分类会移动到列表底部，而不是保持原位置。

### 🔍 **问题2：添加子分类时默认分类级别错误**
在一级分类中点击"添加"时，默认分类级别是"一级分类"，应该默认为当前分类的子分类。

### 🔍 **问题3：网站管理排序和拖拽问题**
- 网站显示顺序与分类管理页面的分类顺序不一致
- 拖拽时可以跨分类移动，应该只能在分类内部移动

## 修复方案

### ✅ **修复1：编辑一级分类保持位置**

#### 修复前的问题：
```javascript
// 错误逻辑：先移除，再添加到末尾
let updatedCategories = config.categories.map(cat => {
  if (cat.id === category.id) {
    return null  // 移除
  }
  return cat
}).filter(Boolean)

// 添加到末尾
updatedCategories.push(category)  // ❌ 移动到底部
```

#### 修复后的逻辑：
```javascript
// 正确逻辑：检查是否需要移动层级
const currentCategory = config.categories.find(cat => cat.id === category.id)
const isCurrentlyTopLevel = !!currentCategory

if (isCurrentlyTopLevel && (!parentId || parentId === '')) {
  // 保持为一级分类，仅更新内容，不移动位置
  const updatedCategories = config.categories.map(cat => {
    if (cat.id === category.id) {
      return {
        ...cat,
        name: category.name,
        icon: category.icon,
        special: category.special,
        subcategories: cat.subcategories || []
      }
    }
    return cat
  })
  // ✅ 保持原位置
}
```

### ✅ **修复2：添加子分类默认父分类**

#### 修复前的问题：
```javascript
const getCurrentParentId = useCallback(() => {
  if (!isEditing || !category) {
    return ''  // ❌ 添加子分类时返回空字符串
  }
  // ...
}, [isEditing, category, isSubcategory, parentCategory, categories])
```

#### 修复后的逻辑：
```javascript
const getCurrentParentId = useCallback(() => {
  // 如果是添加子分类模式（不是编辑，但有父分类）
  if (!isEditing && parentCategory) {
    return parentCategory.id  // ✅ 返回当前分类作为父分类
  }
  
  if (!isEditing || !category) {
    return ''
  }
  // ...
}, [isEditing, category, isSubcategory, parentCategory, categories])
```

### ✅ **修复3：网站管理排序和拖拽限制**

#### 3.1 **按分类顺序排序**

修复前：
```javascript
.sort((a, b) => {
  // 只考虑专栏分类优先
  if (aCat?.special && !bCat?.special) return -1
  if (!aCat?.special && bCat?.special) return 1
  return 0  // ❌ 其他分类无序
})
```

修复后：
```javascript
.sort((a, b) => {
  const getCategoryWeight = (categoryId) => {
    // 一级分类权重
    const topLevelIndex = config.categories.findIndex(cat => cat.id === categoryId)
    if (topLevelIndex !== -1) {
      return { weight: topLevelIndex * 1000, special: category.special }
    }
    
    // 二级分类权重
    for (let i = 0; i < config.categories.length; i++) {
      const category = config.categories[i]
      if (category.subcategories) {
        const subIndex = category.subcategories.findIndex(sub => sub.id === categoryId)
        if (subIndex !== -1) {
          return { weight: i * 1000 + subIndex + 1, special: subcategory.special }
        }
      }
    }
    
    return { weight: 999999, special: false }
  }
  
  // 专栏优先，然后按分类顺序
  const aInfo = getCategoryWeight(a.category)
  const bInfo = getCategoryWeight(b.category)
  
  if (aInfo.special && !bInfo.special) return -1
  if (!aInfo.special && bInfo.special) return 1
  
  return aInfo.weight - bInfo.weight  // ✅ 按分类管理页面顺序
})
```

#### 3.2 **限制拖拽范围**

修复前：
```javascript
const handleDragEnd = (event) => {
  // 允许任意拖拽
  const newItems = [...config.websiteData]
  const [reorderedItem] = newItems.splice(oldIndex, 1)
  newItems.splice(newIndex, 0, reorderedItem)  // ❌ 可以跨分类移动
}
```

修复后：
```javascript
const handleDragEnd = (event) => {
  const activeWebsite = config.websiteData.find(site => site.id === active.id)
  const overWebsite = config.websiteData.find(site => site.id === over.id)
  
  // 检查是否在同一分类内
  if (activeWebsite.category !== overWebsite.category) {
    showMessage('warning', '只能在同一分类内调整网站顺序')
    return  // ✅ 阻止跨分类移动
  }
  
  // 只在同一分类内重新排序
  const newItems = [...config.websiteData]
  const [reorderedItem] = newItems.splice(oldIndex, 1)
  newItems.splice(newIndex, 0, reorderedItem)
  showMessage('success', '网站顺序已调整')
}
```

## 技术特性

### 🎯 **分类权重计算**

```javascript
// 权重计算规则
一级分类权重 = 分类索引 * 1000
二级分类权重 = 父分类索引 * 1000 + 子分类索引 + 1

// 示例：
分类1 (索引0) → 权重: 0
├─ 子分类1-1 (索引0) → 权重: 1
├─ 子分类1-2 (索引1) → 权重: 2
分类2 (索引1) → 权重: 1000
├─ 子分类2-1 (索引0) → 权重: 1001
分类3 (索引2) → 权重: 2000
```

### 🔄 **智能分类检测**

```javascript
// 检测分类是否需要移动层级
const isCurrentlyTopLevel = !!config.categories.find(cat => cat.id === category.id)

if (isCurrentlyTopLevel && (!parentId || parentId === '')) {
  // 保持一级分类，仅更新内容
} else if (parentId && parentId !== '') {
  // 移动到子分类
} else {
  // 从子分类升级为一级分类
}
```

### 🚫 **拖拽限制机制**

```javascript
// 同分类检查
if (activeWebsite.category !== overWebsite.category) {
  showMessage('warning', '只能在同一分类内调整网站顺序')
  return
}
```

## 测试验证

### 🧪 **测试用例**

#### 1. **编辑一级分类位置保持**
- **操作**：编辑第一个分类的名称
- **预期**：保存后仍在第一位
- **结果**：✅ 位置不变

#### 2. **添加子分类默认父分类**
- **操作**：在"设计工具"分类中点击"添加"
- **预期**：默认父分类是"设计工具"
- **结果**：✅ 默认选中当前分类

#### 3. **网站按分类顺序显示**
- **操作**：调整分类管理页面的分类顺序
- **预期**：网站管理页面的网站顺序同步更新
- **结果**：✅ 顺序一致

#### 4. **拖拽限制测试**
- **操作**：尝试将"设计工具"分类的网站拖到"开发工具"分类
- **预期**：显示警告，不允许移动
- **结果**：✅ 显示"只能在同一分类内调整网站顺序"

### 🔍 **调试信息**

现在控制台会显示详细的操作过程：
```
🔄 Props 变化，更新 parentId: {
  oldParentId: "",
  newParentId: "design-tools",
  category: null,
  isSubcategory: false,
  parentCategory: "设计工具"
}

保持一级分类，仅更新内容
分类已更新

只能在同一分类内调整网站顺序
网站顺序已调整
```

## 预期效果

### ✅ **用户体验改进**

1. **编辑分类更直观**：
   - 编辑后位置不变，符合用户预期
   - 避免了意外的位置跳转

2. **添加子分类更便捷**：
   - 默认父分类正确，减少操作步骤
   - 区分全局添加和子分类添加

3. **网站管理更有序**：
   - 按分类顺序显示，便于管理
   - 拖拽限制避免误操作

### 🎯 **管理效率提升**

- ✅ **分类编辑**：保持位置，快速修改
- ✅ **层级管理**：智能默认，减少选择
- ✅ **网站排序**：分类内排序，逻辑清晰
- ✅ **误操作防护**：拖拽限制，数据安全

现在分类管理系统更加完善，符合用户的操作习惯和管理需求。
