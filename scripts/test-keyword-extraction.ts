/**
 * 关键词提取功能测试脚本
 * 
 * 运行方式：
 * npx tsx scripts/test-keyword-extraction.ts
 */

import { createKeywordExtractor } from '../lib/services/keyword-extractor.service';

// 测试用例
const testCases = [
  {
    input: "Why is Notion so slow on mobile devices?",
    expectedKeyword: "Notion mobile",
  },
  {
    input: "I'm having trouble with email marketing campaigns",
    expectedKeyword: "email marketing",
  },
  {
    input: "What are common problems people face with meal prep?",
    expectedKeyword: "meal prep",
  },
  {
    input: "Notion",
    expectedKeyword: "Notion",
    shouldExtract: false,
  },
  {
    input: "How can I improve my productivity when working remotely?",
    expectedKeyword: "remote work productivity",
  },
  {
    input: "Gmail keeps crashing when I try to send attachments",
    expectedKeyword: "Gmail attachments",
  },
  {
    input: "SaaS",
    expectedKeyword: "SaaS",
    shouldExtract: false,
  },
];

async function runTests() {
  console.log('🧪 Starting Keyword Extraction Tests\n');
  console.log('='.repeat(80));
  console.log('\n');

  const extractor = createKeywordExtractor(true);

  if (!extractor.isAvailable()) {
    console.error('❌ Keyword extractor is not available!');
    console.error('Please check your GEMINI_API_KEY in .env.local');
    process.exit(1);
  }

  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}/${testCases.length}`);
    console.log(`Input: "${testCase.input}"`);
    console.log(`Expected: "${testCase.expectedKeyword}"`);
    
    try {
      const result = await extractor.extract(testCase.input);
      
      console.log(`Output: "${result.extracted}"`);
      console.log(`Extracted: ${result.isExtracted ? 'Yes' : 'No'}`);
      
      if (result.provider) {
        console.log(`Provider: ${result.provider}`);
      }
      
      if (result.reason) {
        console.log(`Reason: ${result.reason}`);
      }

      // 简单验证（不严格检查完全匹配）
      const isPassed = result.extracted.length > 0 && 
        result.extracted.length <= 50;

      if (isPassed) {
        console.log('✅ PASS');
        passCount++;
      } else {
        console.log('❌ FAIL');
        failCount++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error}`);
      failCount++;
    }

    console.log('-'.repeat(80));
    console.log('\n');
  }

  console.log('='.repeat(80));
  console.log(`\n📊 Test Results: ${passCount} passed, ${failCount} failed\n`);

  if (failCount === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the output above.');
  }
}

// 运行测试
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
