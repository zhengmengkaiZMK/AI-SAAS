/**
 * 配额功能自动化测试脚本
 * 在浏览器控制台中运行
 */

// 测试配置
const CONFIG = {
  API_URL: '/api/pain-points/analyze',
  TEST_QUERY: 'Notion',
  PLATFORMS: ['reddit'],
};

// 工具函数
const log = (message, data) => {
  console.log(`[配额测试] ${message}`, data || '');
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ========== 游客模式测试 ==========

async function testGuestMode() {
  log('开始测试游客模式...');
  
  // 1. 清除本地存储
  localStorage.removeItem('pain_point_guest_usage');
  log('✓ 已清除本地存储');
  
  // 2. 检查初始状态
  const initialCount = JSON.parse(localStorage.getItem('pain_point_guest_usage') || '{"count":0}').count;
  log(`初始使用次数: ${initialCount}`);
  
  // 3. 模拟3次搜索
  for (let i = 0; i < 3; i++) {
    log(`执行第 ${i + 1} 次搜索...`);
    
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${CONFIG.TEST_QUERY} ${i + 1}`,
          platforms: CONFIG.PLATFORMS,
          isGuest: true,
          guestUsageCount: i,
        }),
      });
      
      log(`第 ${i + 1} 次搜索响应:`, {
        status: response.status,
        ok: response.ok,
      });
      
      await sleep(1000); // 等待1秒
    } catch (error) {
      log(`❌ 第 ${i + 1} 次搜索失败:`, error.message);
    }
  }
  
  // 4. 测试第4次（应该失败）
  log('测试第4次搜索（预期失败）...');
  
  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${CONFIG.TEST_QUERY} 4`,
        platforms: CONFIG.PLATFORMS,
        isGuest: true,
        guestUsageCount: 3,
      }),
    });
    
    if (response.status === 403) {
      const data = await response.json();
      log('✓ 第4次搜索正确被拒绝:', data);
      
      if (data.error === 'GUEST_QUOTA_EXCEEDED' && data.redirectTo === '/signup') {
        log('✅ 游客模式测试通过！');
        return true;
      } else {
        log('❌ 错误码或跳转路径不正确');
        return false;
      }
    } else {
      log('❌ 第4次搜索应该返回403，实际返回:', response.status);
      return false;
    }
  } catch (error) {
    log('❌ 测试失败:', error.message);
    return false;
  }
}

// ========== 跨天重置测试 ==========

function testCrossDayReset() {
  log('开始测试跨天重置...');
  
  // 设置昨天的日期
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  localStorage.setItem('pain_point_guest_usage', JSON.stringify({
    count: 3,
    lastReset: yesterdayStr,
  }));
  
  log('✓ 已设置昨天的配额记录:', {
    count: 3,
    lastReset: yesterdayStr,
  });
  
  // 导入跟踪器模块并检查
  log('请手动在UI中执行一次搜索，验证配额是否重置为0');
  log('或者在控制台运行: getGuestUsageCount()');
}

// ========== 使用次数跟踪测试 ==========

function testUsageTracker() {
  log('开始测试使用次数跟踪...');
  
  // 清除记录
  localStorage.removeItem('pain_point_guest_usage');
  log('✓ 已清除记录');
  
  // 模拟增加次数
  const tests = [
    { count: 0, action: 'init' },
    { count: 1, action: 'increment' },
    { count: 2, action: 'increment' },
    { count: 3, action: 'increment' },
  ];
  
  tests.forEach(({ count, action }) => {
    if (action === 'increment') {
      const stored = JSON.parse(localStorage.getItem('pain_point_guest_usage') || '{"count":0}');
      stored.count++;
      stored.lastReset = new Date().toISOString().split('T')[0];
      localStorage.setItem('pain_point_guest_usage', JSON.stringify(stored));
    }
    
    const current = JSON.parse(localStorage.getItem('pain_point_guest_usage') || '{"count":0}');
    log(`${action} -> 当前次数: ${current.count}`, current);
  });
  
  log('✅ 使用次数跟踪测试完成');
}

// ========== 主测试流程 ==========

async function runAllTests() {
  console.clear();
  log('========================================');
  log('配额功能自动化测试');
  log('========================================\n');
  
  try {
    // 测试1: 使用次数跟踪
    log('\n【测试1】使用次数跟踪');
    log('----------------------------------------');
    testUsageTracker();
    await sleep(2000);
    
    // 测试2: 跨天重置
    log('\n【测试2】跨天重置');
    log('----------------------------------------');
    testCrossDayReset();
    await sleep(2000);
    
    // 测试3: 游客模式（需要确认是否执行，因为会发起真实请求）
    log('\n【测试3】游客模式（需要手动确认）');
    log('----------------------------------------');
    const confirmTest = confirm('是否执行游客模式测试？（会发起3次真实搜索请求）');
    
    if (confirmTest) {
      const result = await testGuestMode();
      log(result ? '\n✅ 所有测试通过！' : '\n❌ 测试失败，请检查日志');
    } else {
      log('⏭️  已跳过游客模式测试');
    }
    
    log('\n========================================');
    log('测试完成');
    log('========================================');
    
  } catch (error) {
    log('❌ 测试过程中发生错误:', error);
  }
}

// ========== 导出测试函数 ==========

window.quotaTests = {
  runAll: runAllTests,
  testGuest: testGuestMode,
  testReset: testCrossDayReset,
  testTracker: testUsageTracker,
};

// 自动运行
log('配额测试脚本已加载！');
log('运行方式：');
log('  • quotaTests.runAll() - 运行所有测试');
log('  • quotaTests.testGuest() - 测试游客模式');
log('  • quotaTests.testReset() - 测试跨天重置');
log('  • quotaTests.testTracker() - 测试使用次数跟踪');
