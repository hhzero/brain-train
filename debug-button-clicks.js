// 按钮点击调试脚本
// 在浏览器控制台运行此脚本来检查按钮点击事件

console.log('🔍 开始按钮点击调试...');

// 1. 检查所有按钮元素
const buttons = document.querySelectorAll('button');
console.log(`📊 找到 ${buttons.length} 个按钮元素:`, buttons);

// 2. 检查每个按钮的事件监听器
buttons.forEach((button, index) => {
  console.log(`\n🔘 按钮 ${index + 1}:`);
  console.log('  - 文本内容:', button.textContent.trim());
  console.log('  - 类名:', button.className);
  console.log('  - 是否禁用:', button.disabled);
  console.log('  - 样式display:', getComputedStyle(button).display);
  console.log('  - 样式visibility:', getComputedStyle(button).visibility);
  console.log('  - 样式pointer-events:', getComputedStyle(button).pointerEvents);
  console.log('  - 样式z-index:', getComputedStyle(button).zIndex);
  console.log('  - 位置信息:', button.getBoundingClientRect());
  
  // 检查是否有onClick事件
  if (button.onclick) {
    console.log('  - 有onclick属性');
  } else {
    console.log('  - 无onclick属性');
  }
});

// 3. 检查Link组件（Next.js Link）
const links = document.querySelectorAll('a');
console.log(`\n🔗 找到 ${links.length} 个链接元素:`, links);

links.forEach((link, index) => {
  if (link.querySelector('button')) {
    console.log(`\n🔗 包含按钮的链接 ${index + 1}:`);
    console.log('  - href:', link.href);
    console.log('  - 类名:', link.className);
    console.log('  - 样式pointer-events:', getComputedStyle(link).pointerEvents);
    console.log('  - 位置信息:', link.getBoundingClientRect());
  }
});

// 4. 检查是否有遮挡元素
function checkElementAtPoint(x, y) {
  const element = document.elementFromPoint(x, y);
  console.log(`\n📍 坐标 (${x}, ${y}) 处的元素:`, element);
  return element;
}

// 检查页面中心是否有遮挡
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
checkElementAtPoint(centerX, centerY);

// 5. 添加临时点击监听器来测试事件冒泡
function addTestClickListener() {
  document.addEventListener('click', function(e) {
    console.log('\n🖱️ 点击事件触发:');
    console.log('  - 目标元素:', e.target);
    console.log('  - 当前目标:', e.currentTarget);
    console.log('  - 事件阶段:', e.eventPhase);
    console.log('  - 是否冒泡:', e.bubbles);
    console.log('  - 坐标:', { x: e.clientX, y: e.clientY });
  }, true); // 使用捕获阶段
  
  console.log('\n✅ 已添加全局点击监听器，请尝试点击按钮');
}

addTestClickListener();

// 6. 检查React事件系统
function checkReactEvents() {
  const reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]');
  if (reactRoot) {
    console.log('\n⚛️ 找到React根元素:', reactRoot);
    
    // 检查React Fiber
    const fiberKey = Object.keys(reactRoot).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber'));
    if (fiberKey) {
      console.log('  - React Fiber已挂载');
    } else {
      console.log('  - ⚠️ 未找到React Fiber');
    }
  } else {
    console.log('\n⚠️ 未找到React根元素');
  }
}

checkReactEvents();

// 7. 模拟按钮点击
function simulateButtonClick() {
  const firstButton = buttons[0];
  if (firstButton) {
    console.log('\n🎯 模拟点击第一个按钮...');
    
    // 创建点击事件
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    // 触发事件
    const result = firstButton.dispatchEvent(clickEvent);
    console.log('  - 事件分发结果:', result);
    
    // 也尝试直接调用click方法
    setTimeout(() => {
      console.log('  - 尝试直接调用click()方法...');
      firstButton.click();
    }, 1000);
  }
}

setTimeout(simulateButtonClick, 2000);

console.log('\n🏁 调试脚本设置完成！请查看上述信息并尝试点击按钮。');
console.log('💡 提示：如果按钮无法点击，请检查:');
console.log('  1. 按钮是否被其他元素遮挡');
console.log('  2. 按钮的pointer-events样式');
console.log('  3. 按钮是否处于disabled状态');
console.log('  4. React事件系统是否正常工作');