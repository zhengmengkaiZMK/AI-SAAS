/**
 * Serper 双平台搜索功能测试脚本
 * 测试 Reddit 和 X 平台的数据抓取
 */

import { SerperService } from '../lib/services/serper.service';

async function testSerperCombinedSearch() {
  console.log('🧪 Starting Serper Combined Search Tests\n');
  console.log('=' .repeat(60));

  // 测试关键词
  const testQuery = 'productivity app';
  const numPerPlatform = 20;

  try {
    // 测试1: Reddit 单独搜索
    console.log('\n📝 Test 1: Reddit Search (20 posts)');
    console.log('-'.repeat(60));
    
    const redditStartTime = Date.now();
    const redditResult = await SerperService.searchReddit({
      query: testQuery,
      num: numPerPlatform,
    });
    const redditDuration = Date.now() - redditStartTime;
    
    console.log(`✅ Reddit search completed in ${redditDuration}ms`);
    console.log(`   Posts found: ${redditResult.posts.length}`);
    console.log(`   Platform: ${redditResult.platform}`);
    console.log(`   First post: ${redditResult.posts[0]?.title}`);
    
    // 验证Reddit结果
    if (redditResult.posts.length === 0) {
      console.warn('⚠️  Warning: No Reddit posts found');
    } else {
      // 检查平台标记
      const allReddit = redditResult.posts.every(p => p.platform === 'reddit');
      console.log(`   All posts tagged as reddit: ${allReddit ? '✅' : '❌'}`);
      
      // 检查subreddit字段
      const hasSubreddits = redditResult.posts.some(p => p.subreddit);
      console.log(`   Has subreddit info: ${hasSubreddits ? '✅' : '❌'}`);
    }

    // 测试2: X 单独搜索
    console.log('\n📝 Test 2: X(Twitter) Search (20 posts)');
    console.log('-'.repeat(60));
    
    const xStartTime = Date.now();
    const xResult = await SerperService.searchX({
      query: testQuery,
      num: numPerPlatform,
    });
    const xDuration = Date.now() - xStartTime;
    
    console.log(`✅ X search completed in ${xDuration}ms`);
    console.log(`   Posts found: ${xResult.posts.length}`);
    console.log(`   Platform: ${xResult.platform}`);
    console.log(`   First post: ${xResult.posts[0]?.title}`);
    
    // 验证X结果
    if (xResult.posts.length === 0) {
      console.warn('⚠️  Warning: No X posts found');
    } else {
      // 检查平台标记
      const allX = xResult.posts.every(p => p.platform === 'x');
      console.log(`   All posts tagged as x: ${allX ? '✅' : '❌'}`);
      
      // 检查域名
      const validDomains = xResult.posts.every(p => 
        p.domain.includes('twitter.com') || p.domain.includes('x.com')
      );
      console.log(`   Valid X domains: ${validDomains ? '✅' : '❌'}`);
    }

    // 测试3: 组合搜索（并行）
    console.log('\n📝 Test 3: Combined Search (Reddit + X, 20 each)');
    console.log('-'.repeat(60));
    
    const combinedStartTime = Date.now();
    const combinedResult = await SerperService.searchBoth({
      query: testQuery,
      num: numPerPlatform,
    });
    const combinedDuration = Date.now() - combinedStartTime;
    
    console.log(`✅ Combined search completed in ${combinedDuration}ms`);
    console.log(`   Reddit posts: ${combinedResult.redditPosts.length}`);
    console.log(`   X posts: ${combinedResult.xPosts.length}`);
    console.log(`   Total posts: ${combinedResult.total}`);
    console.log(`   Average search time: ${combinedResult.searchTime.toFixed(2)}s`);
    
    // 验证组合结果
    console.log('\n🔍 Validation Results:');
    console.log('-'.repeat(60));
    
    const expectedTotal = combinedResult.redditPosts.length + combinedResult.xPosts.length;
    const totalMatches = combinedResult.total === expectedTotal;
    console.log(`✓ Total count matches: ${totalMatches ? '✅' : '❌'} (${combinedResult.total} === ${expectedTotal})`);
    
    const hasRedditData = combinedResult.redditPosts.length > 0;
    console.log(`✓ Has Reddit data: ${hasRedditData ? '✅' : '⚠️  None found'}`);
    
    const hasXData = combinedResult.xPosts.length > 0;
    console.log(`✓ Has X data: ${hasXData ? '✅' : '⚠️  None found'}`);
    
    // 检查平台标记
    const redditTagsCorrect = combinedResult.redditPosts.every(p => p.platform === 'reddit');
    console.log(`✓ Reddit posts tagged correctly: ${redditTagsCorrect ? '✅' : '❌'}`);
    
    const xTagsCorrect = combinedResult.xPosts.every(p => p.platform === 'x');
    console.log(`✓ X posts tagged correctly: ${xTagsCorrect ? '✅' : '❌'}`);
    
    // 性能对比
    console.log('\n⚡ Performance Comparison:');
    console.log('-'.repeat(60));
    const sequentialTime = redditDuration + xDuration;
    const parallelTime = combinedDuration;
    const timeSaved = sequentialTime - parallelTime;
    const improvement = ((timeSaved / sequentialTime) * 100).toFixed(1);
    
    console.log(`   Sequential (Reddit + X): ${sequentialTime}ms`);
    console.log(`   Parallel (Combined): ${parallelTime}ms`);
    console.log(`   Time saved: ${timeSaved}ms (${improvement}% faster)`);
    
    // 展示样例数据
    console.log('\n📊 Sample Data:');
    console.log('-'.repeat(60));
    
    if (combinedResult.redditPosts.length > 0) {
      const redditSample = combinedResult.redditPosts[0];
      console.log('\n🔴 Reddit Sample:');
      console.log(`   Title: ${redditSample.title}`);
      console.log(`   Subreddit: r/${redditSample.subreddit || 'N/A'}`);
      console.log(`   Platform: ${redditSample.platform}`);
      console.log(`   Link: ${redditSample.link.substring(0, 60)}...`);
    }
    
    if (combinedResult.xPosts.length > 0) {
      const xSample = combinedResult.xPosts[0];
      console.log('\n🔵 X Sample:');
      console.log(`   Title: ${xSample.title}`);
      console.log(`   Platform: ${xSample.platform}`);
      console.log(`   Link: ${xSample.link.substring(0, 60)}...`);
    }
    
    // 最终结果
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed successfully!');
    console.log('='.repeat(60));
    
    // 返回测试结果
    return {
      success: true,
      results: {
        reddit: {
          count: redditResult.posts.length,
          duration: redditDuration,
        },
        x: {
          count: xResult.posts.length,
          duration: xDuration,
        },
        combined: {
          redditCount: combinedResult.redditPosts.length,
          xCount: combinedResult.xPosts.length,
          total: combinedResult.total,
          duration: combinedDuration,
        },
      },
    };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nError details:', error instanceof Error ? error.message : error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 运行测试
if (require.main === module) {
  testSerperCombinedSearch()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Test suite passed');
        process.exit(0);
      } else {
        console.log('\n❌ Test suite failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { testSerperCombinedSearch };
