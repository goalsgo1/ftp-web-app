<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>디스크 사용량 모니터링</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            position: relative;
        }
        
        h1 {
            color: #667eea;
            margin-bottom: 30px;
            text-align: center;
            font-size: 2.5em;
        }
        
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            margin-bottom: 20px;
            transition: background 0.3s;
        }
        
        .refresh-btn:hover {
            background: #764ba2;
        }
        
        .disk-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .disk-card {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 5px;
        }
        
        .disk-card h3 {
            color: #764ba2;
            margin-bottom: 15px;
        }
        
        .disk-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
        }
        
        .disk-item strong {
            color: #333;
            display: block;
            margin-bottom: 5px;
        }
        
        .progress-bar {
            width: 100%;
            height: 25px;
            background: #e9ecef;
            border-radius: 5px;
            overflow: hidden;
            margin-top: 10px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .progress-fill.low {
            background: linear-gradient(90deg, #28a745, #20c997);
        }
        
        .progress-fill.medium {
            background: linear-gradient(90deg, #ffc107, #ff9800);
        }
        
        .progress-fill.high {
            background: linear-gradient(90deg, #dc3545, #c82333);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        
        .stat-card h4 {
            margin-bottom: 10px;
            opacity: 0.9;
        }
        
        .stat-card .value {
            font-size: 2em;
            font-weight: bold;
        }
        
        .timestamp {
            text-align: center;
            color: #666;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #dc3545;
            margin: 20px 0;
        }
        
        .home-btn {
            position: absolute;
            left: 20px;
            top: 20px;
            padding: 10px 18px;
            background: #667eea;
            color: white;
            border-radius: 6px;
            text-decoration: none;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            transition: background 0.3s;
        }
        .home-btn:hover {
            background: #764ba2;
        }
    </style>
</head>
<body>
    <div class="container">
        <a class="home-btn" href="index.html">← 홈으로</a>
        <h1>💾 디스크 사용량 모니터링</h1>
        
        <button class="refresh-btn" onclick="location.reload()">🔄 새로고침</button>
        
        <div id="disk-info">
            <!-- PHP로 데이터를 불러올 예정 -->
            <?php
            // 디스크 정보 가져오기
            function getDiskInfo($path = '/') {
                $output = shell_exec('df -h ' . escapeshellarg($path) . ' 2>&1');
                if ($output === null) {
                    return null;
                }
                
                $lines = explode("\n", trim($output));
                if (count($lines) < 2) {
                    return null;
                }
                
                // 헤더 건너뛰고 두 번째 줄 파싱
                $data = preg_split('/\s+/', $lines[1]);
                
                if (count($data) < 5) {
                    return null;
                }
                
                return [
                    'filesystem' => $data[0],
                    'total' => $data[1],
                    'used' => $data[2],
                    'available' => $data[3],
                    'use_percent' => $data[4],
                    'mounted' => $data[5] ?? '/'
                ];
            }
            
            $diskInfo = getDiskInfo('/');
            $externalInfo = getDiskInfo('/mnt/external');
            
            if ($diskInfo) {
                $usePercent = (int)str_replace('%', '', $diskInfo['use_percent']);
                $progressClass = 'low';
                if ($usePercent >= 80) {
                    $progressClass = 'high';
                } else if ($usePercent >= 60) {
                    $progressClass = 'medium';
                }
                
            ?>
            
            <div class="disk-info">
                <div class="disk-card">
                    <h3>📊 루트 디렉토리 (/)</h3>
                    <div class="disk-item">
                        <strong>파일시스템:</strong> <?php echo htmlspecialchars($diskInfo['filesystem']); ?>
                    </div>
                    <div class="disk-item">
                        <strong>총 용량:</strong> <?php echo htmlspecialchars($diskInfo['total']); ?>
                    </div>
                    <div class="disk-item">
                        <strong>사용 중:</strong> <?php echo htmlspecialchars($diskInfo['used']); ?>
                    </div>
                    <div class="disk-item">
                        <strong>사용 가능:</strong> <?php echo htmlspecialchars($diskInfo['available']); ?>
                    </div>
                    <div class="disk-item">
                        <strong>사용률:</strong> <?php echo htmlspecialchars($diskInfo['use_percent']); ?>
                        <div class="progress-bar">
                            <div class="progress-fill <?php echo $progressClass; ?>" style="width: <?php echo $usePercent; ?>%">
                                <?php echo $usePercent; ?>%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>총 용량</h4>
                    <div class="value"><?php echo htmlspecialchars($diskInfo['total']); ?></div>
                </div>
                <div class="stat-card">
                    <h4>사용 중</h4>
                    <div class="value"><?php echo htmlspecialchars($diskInfo['used']); ?></div>
                </div>
                <div class="stat-card">
                    <h4>사용 가능</h4>
                    <div class="value"><?php echo htmlspecialchars($diskInfo['available']); ?></div>
                </div>
                <div class="stat-card">
                    <h4>사용률</h4>
                    <div class="value"><?php echo htmlspecialchars($diskInfo['use_percent']); ?></div>
                </div>
            </div>
            
            <?php if ($externalInfo) {
                $externalUsePercent = (int)str_replace('%', '', $externalInfo['use_percent']);
                $externalClass = 'low';
                if ($externalUsePercent >= 80) {
                    $externalClass = 'high';
                } else if ($externalUsePercent >= 60) {
                    $externalClass = 'medium';
                }
            ?>
            <div class="disk-info" style="margin-top: 30px;">
                <div class="disk-card">
                    <h3>💽 외장 공유 디렉토리 (/mnt/external)</h3>
                    <div class="disk-item">
                        <strong>파일시스템:</strong> <?php echo htmlspecialchars($externalInfo['filesystem']); ?>
                    </div>
                    <div class="disk-item">
                        <strong>총 용량:</strong> <?php echo htmlspecialchars($externalInfo['total']); ?>
                    </div>
                    <div class="disk-item">
                        <strong>사용 중:</strong> <?php echo htmlspecialchars($externalInfo['used']); ?>
                    </div>
                    <div class="disk-item">
                        <strong>사용 가능:</strong> <?php echo htmlspecialchars($externalInfo['available']); ?>
                    </div>
                    <div class="disk-item">
                        <strong>사용률:</strong> <?php echo htmlspecialchars($externalInfo['use_percent']); ?>
                        <div class="progress-bar">
                            <div class="progress-fill <?php echo $externalClass; ?>" style="width: <?php echo $externalUsePercent; ?>%">
                                <?php echo $externalUsePercent; ?>%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>외장 총 용량</h4>
                    <div class="value"><?php echo htmlspecialchars($externalInfo['total']); ?></div>
                </div>
                <div class="stat-card">
                    <h4>외장 사용 중</h4>
                    <div class="value"><?php echo htmlspecialchars($externalInfo['used']); ?></div>
                </div>
                <div class="stat-card">
                    <h4>외장 사용 가능</h4>
                    <div class="value"><?php echo htmlspecialchars($externalInfo['available']); ?></div>
                </div>
                <div class="stat-card">
                    <h4>외장 사용률</h4>
                    <div class="value"><?php echo htmlspecialchars($externalInfo['use_percent']); ?></div>
                </div>
            </div>
            <?php } else { ?>
                <div class="error" style="margin-top: 30px;">
                    외장 공유 디렉토리(/mnt/external)를 찾을 수 없습니다. 마운트 상태를 확인하세요.
                </div>
            <?php } ?>
            
            <?php
            } else {
                echo '<div class="error">디스크 정보를 가져올 수 없습니다. PHP가 shell_exec를 실행할 수 있는 권한이 있는지 확인하세요.</div>';
            }
            ?>
        </div>
        
        <div class="timestamp">
            <p>🕐 업데이트 시간: <?php echo date('Y년 m월 d일 H시 i분 s초'); ?></p>
            <p style="margin-top: 10px; font-size: 0.9em; color: #999;">
                자동 새로고침: <span id="countdown">30</span>초 후
            </p>
        </div>
    </div>
    
    <script>
        // 자동 새로고침 (30초)
        let countdown = 30;
        const countdownElement = document.getElementById('countdown');
        
        setInterval(() => {
            countdown--;
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }
            if (countdown <= 0) {
                location.reload();
            }
        }, 1000);
    </script>
</body>
</html>

