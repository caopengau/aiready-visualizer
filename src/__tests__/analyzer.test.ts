import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { analyzeTestability } from '../analyzer';
import { join } from 'path';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';

describe('Testability Analyzer', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = join(tmpdir(), `aiready-testability-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function createTestFile(name: string, content: string): string {
    const filePath = join(tmpDir, name);
    const dir = join(filePath, '..');
    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, content, 'utf8');
    return filePath;
  }

  it('detects test frameworks in multiple languages', async () => {
    const pyDir = join(tmpDir, 'python-project');
    mkdirSync(pyDir);
    writeFileSync(join(pyDir, 'requirements.txt'), 'pytest==7.0.0');
    writeFileSync(join(pyDir, 'app.py'), 'def add(a, b): return a + b');
    writeFileSync(join(pyDir, 'test_app.py'), 'import pytest');

    const javaDir = join(tmpDir, 'java-project');
    mkdirSync(javaDir);
    writeFileSync(
      join(javaDir, 'pom.xml'),
      '<project><dependencies><dependency><artifactId>junit</artifactId></dependency></dependencies></project>'
    );
    writeFileSync(join(javaDir, 'App.java'), 'public class App {}');

    const goDir = join(tmpDir, 'go-project');
    mkdirSync(goDir);
    writeFileSync(join(goDir, 'go.mod'), 'module test');
    writeFileSync(join(goDir, 'main.go'), 'package main');

    // Test Python detection
    const pyReport = await analyzeTestability({ rootDir: pyDir });
    expect(pyReport.rawData.hasTestFramework).toBe(true);

    // Test Java detection
    const javaReport = await analyzeTestability({ rootDir: javaDir });
    expect(javaReport.rawData.hasTestFramework).toBe(true);

    // Test Go detection
    const goReport = await analyzeTestability({ rootDir: goDir });
    expect(goReport.rawData.hasTestFramework).toBe(true);
  }, 15000);

  it('flags missing test framework as critical', async () => {
    const emptyDir = join(tmpDir, 'no-tests');
    mkdirSync(emptyDir);
    writeFileSync(join(emptyDir, 'App.ts'), 'export const a = 1;');

    const report = await analyzeTestability({ rootDir: emptyDir });
    expect(report.rawData.hasTestFramework).toBe(false);
    // Rating is 'unverifiable' when no framework is found
    expect(report.summary.rating).toBe('unverifiable');
  });

  it('detects injection patterns in classes', async () => {
    createTestFile(
      'src/di.ts',
      'export class UserService { constructor(db: any) {} }'
    );
    const report = await analyzeTestability({ rootDir: tmpDir });
    expect(report.rawData.injectionPatterns).toBeGreaterThan(0);
  });

  it('detects bloated interfaces', async () => {
    createTestFile(
      'src/bloated.ts',
      'export interface Big { m1(); m2(); m3(); m4(); m5(); m6(); m7(); m8(); m9(); m10(); m11(); m12(); }'
    );
    const report = await analyzeTestability({ rootDir: tmpDir });
    expect(report.rawData.bloatedInterfaces).toBeGreaterThan(0);
  });

  it('gracefully handles missing parser or read errors', async () => {
    createTestFile('src/unknown.xyz', 'some content');
    const report = await analyzeTestability({ rootDir: tmpDir });
    expect(report).toBeDefined();
    expect(report.summary.sourceFiles).toBeGreaterThan(0);
  });
});
