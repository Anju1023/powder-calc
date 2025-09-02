// 粉を追加する関数
function addPowder() {
	const powderList = document.getElementById('powderList');
	const newPowder = document.createElement('div');
	newPowder.className = 'powder-item';
	newPowder.innerHTML = `
		<div class="input-group">
			<label>粉名:</label>
			<input type="text" class="powder-name" placeholder="例: 強力粉" />
			<label>割合:</label>
			<input type="number" class="powder-ratio" value="0" step="0.1" />
			<span>%</span>
			<button type="button" class="remove" onclick="removePowder(this)">削除</button>
		</div>
	`;
	powderList.appendChild(newPowder);
}

// 粉を削除する関数
function removePowder(button) {
	const powderList = document.getElementById('powderList');
	if (powderList.children.length > 1) {
		button.closest('.powder-item').remove();
	} else {
		alert('最低1つの粉が必要です。');
	}
}

// その他材料を追加する関数
function addOther() {
	const otherList = document.getElementById('otherList');
	const newOther = document.createElement('div');
	newOther.className = 'other-item';
	newOther.innerHTML = `
		<div class="input-group">
			<label>材料名:</label>
			<input type="text" class="other-name" placeholder="例: 水" />
			<label>割合:</label>
			<input type="number" class="other-ratio" value="0" step="0.1" />
			<span>%</span>
			<button type="button" class="remove" onclick="removeOther(this)">削除</button>
		</div>
	`;
	otherList.appendChild(newOther);
}

// その他材料を削除する関数
function removeOther(button) {
	const otherList = document.getElementById('otherList');
	if (otherList.children.length > 1) {
		button.closest('.other-item').remove();
	} else {
		alert('最低1つの材料が必要です。');
	}
}

// 計算実行関数
function calculate() {
	const breadWeight = parseFloat(document.getElementById('breadWeight').value);
	const powderItems = document.querySelectorAll('.powder-item');
	const otherItems = document.querySelectorAll('.other-item');

	if (!breadWeight || breadWeight <= 0) {
		alert('パンの重さを正しく入力してください。');
		return;
	}

	const powders = [];
	const others = [];
	let powderTotalRatio = 0;

	// 粉のデータを収集
	powderItems.forEach((item) => {
		const name = item.querySelector('.powder-name').value.trim();
		const ratio = parseFloat(item.querySelector('.powder-ratio').value);

		if (name && !isNaN(ratio) && ratio >= 0) {
			powders.push({ name, ratio, type: '粉' });
			powderTotalRatio += ratio;
		}
	});

	// その他材料のデータを収集
	otherItems.forEach((item) => {
		const name = item.querySelector('.other-name').value.trim();
		const ratio = parseFloat(item.querySelector('.other-ratio').value);

		if (name && !isNaN(ratio) && ratio >= 0) {
			others.push({ name, ratio, type: 'その他' });
		}
	});

	if (powders.length === 0) {
		alert('粉の情報を正しく入力してください。');
		return;
	}

	// 粉の重さを計算（粉の重さを100%として計算）
	// 粉の重さ = パンの重さ × 100 ÷ (100 + その他材料の合計割合)
	const otherTotalRatio = others.reduce((sum, item) => sum + item.ratio, 0);
	const totalRatio = 100 + otherTotalRatio;
	const powderWeight = (breadWeight * 100) / totalRatio;

	// 結果を表示
	displayResults(
		powders,
		others,
		powderWeight,
		powderTotalRatio,
		otherTotalRatio
	);
}

// 結果表示関数
function displayResults(
	powders,
	others,
	powderWeight,
	powderTotalRatio,
	otherTotalRatio
) {
	const resultSection = document.getElementById('resultSection');
	const totalRatioDiv = document.getElementById('totalRatio');
	const resultBody = document.getElementById('resultBody');

	// 全体の割合を表示
	totalRatioDiv.innerHTML = `
		<p><strong>粉の合計: ${powderTotalRatio.toFixed(1)}%</strong></p>
		<p><strong>その他材料の合計: ${otherTotalRatio.toFixed(1)}%</strong></p>
		<p><strong>全体の合計: ${(powderTotalRatio + otherTotalRatio).toFixed(
			1
		)}%</strong></p>
	`;

	// テーブルをクリア
	resultBody.innerHTML = '';

	// 粉の必要量を計算して表示
	powders.forEach((powder) => {
		// 各粉の必要量 = 粉の重さ × 各粉の割合 ÷ 100
		const requiredAmount = (powderWeight * powder.ratio) / 100;

		const row = document.createElement('tr');
		row.innerHTML = `
			<td>${powder.name}</td>
			<td>${powder.ratio.toFixed(1)}</td>
			<td>${requiredAmount.toFixed(1)}</td>
			<td>粉</td>
		`;
		resultBody.appendChild(row);
	});

	// その他材料の必要量を計算して表示
	others.forEach((other) => {
		// 各材料の必要量 = 粉の重さ × 各材料の割合 ÷ 100
		const requiredAmount = (powderWeight * other.ratio) / 100;

		const row = document.createElement('tr');
		row.innerHTML = `
			<td>${other.name}</td>
			<td>${other.ratio.toFixed(1)}</td>
			<td>${requiredAmount.toFixed(1)}</td>
			<td>その他</td>
		`;
		resultBody.appendChild(row);
	});

	// 結果セクションを表示
	resultSection.style.display = 'block';
}

// Excel用にコピーする関数
function copyToClipboard() {
	const resultBody = document.getElementById('resultBody');
	const rows = resultBody.querySelectorAll('tr');

	if (rows.length === 0) {
		showCopyStatus('計算結果がありません', 'error');
		return;
	}

	// 材料名と使用量のみをコピー
	let copyText = '';

	// データ行を追加（材料名と使用量のみ）
	rows.forEach((row) => {
		const cells = row.querySelectorAll('td');
		if (cells.length >= 3) {
			const materialName = cells[0].textContent; // 材料名
			const amount = cells[2].textContent; // 使用量
			copyText += `${materialName}\t${amount}\n`;
		}
	});

	// クリップボードにコピー
	if (navigator.clipboard && window.isSecureContext) {
		// モダンブラウザ用
		navigator.clipboard
			.writeText(copyText)
			.then(() => {
				showCopyStatus('✅ クリップボードにコピーしました！', 'success');
			})
			.catch((err) => {
				console.error('コピーに失敗しました:', err);
				fallbackCopyTextToClipboard(copyText);
			});
	} else {
		// フォールバック用
		fallbackCopyTextToClipboard(copyText);
	}
}

// フォールバック用のコピー関数
function fallbackCopyTextToClipboard(text) {
	const textArea = document.createElement('textarea');
	textArea.value = text;
	textArea.style.position = 'fixed';
	textArea.style.left = '-999999px';
	textArea.style.top = '-999999px';
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		const successful = document.execCommand('copy');
		if (successful) {
			showCopyStatus('✅ クリップボードにコピーしました！', 'success');
		} else {
			showCopyStatus('❌ コピーに失敗しました', 'error');
		}
	} catch (err) {
		console.error('フォールバック コピーに失敗しました:', err);
		showCopyStatus('❌ コピーに失敗しました', 'error');
	}

	document.body.removeChild(textArea);
}

// コピー状態を表示する関数
function showCopyStatus(message, type) {
	const statusElement = document.getElementById('copyStatus');
	statusElement.textContent = message;
	statusElement.className = `copy-status show ${type}`;

	// 3秒後にメッセージを非表示
	setTimeout(() => {
		statusElement.className = 'copy-status';
	}, 3000);
}
