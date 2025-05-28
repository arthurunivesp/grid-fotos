// Gerador de Grid de Fotos - Script Principal com Exportação

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const photoFormatSelect = document.getElementById('photo-format');
    const customFormatDiv = document.getElementById('custom-format');
    const gridLayoutSelect = document.getElementById('grid-layout');
    const customLayoutDiv = document.getElementById('custom-layout');
    const generateGridBtn = document.getElementById('generate-grid');
    const exportGridBtn = document.getElementById('export-grid');
    const photoGrid = document.getElementById('photo-grid');
    const gridSizeDisplay = document.getElementById('grid-size-display');
    const photoSizeDisplay = document.getElementById('photo-size-display');
    const photoSpaceTemplate = document.getElementById('photo-space-template');
    const exportQuality = document.getElementById('export-quality');
    const qualityValue = document.getElementById('quality-value');
    const exportFormat = document.getElementById('export-format');
    const exportScale = document.getElementById('export-scale');
    const exportFilename = document.getElementById('export-filename');
    const exportStatus = document.getElementById('export-status');
    
    // Configurações
    const config = {
        gridWidth: 18, // cm
        gridHeight: 18, // cm
        photoCount: 9,
        photoFormat: 'portrait-3x4',
        customWidth: 3, // cm
        customHeight: 4, // cm
        gridSpacing: 2, // mm
        gridLayout: 'auto',
        gridRows: 3,
        gridColumns: 3,
        exportFormat: 'png',
        exportQuality: 0.9,
        exportScale: 2,
        exportFilename: 'meu_grid_de_fotos'
    };
    
    // Event Listeners para controles de configuração
    photoFormatSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customFormatDiv.classList.remove('hidden');
        } else {
            customFormatDiv.classList.add('hidden');
        }
        updateConfig();
    });
    
    gridLayoutSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customLayoutDiv.classList.remove('hidden');
        } else {
            customLayoutDiv.classList.add('hidden');
        }
        updateConfig();
    });
    
    // Atualizar valor de qualidade exibido
    exportQuality.addEventListener('input', function() {
        qualityValue.textContent = Math.round(this.value * 100) + '%';
    });
    
    // Atualizar configurações quando os inputs mudarem
    document.querySelectorAll('.config-panel input, .config-panel select').forEach(input => {
        input.addEventListener('change', updateConfig);
        input.addEventListener('input', updateConfig); // Adicionado para capturar mudanças em tempo real
    });
    
    // Botão para gerar grid - Corrigido para garantir funcionamento
    generateGridBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevenir comportamento padrão
        console.log("Botão Gerar Grid clicado");
        generateGrid();
    });
    
    // Botão para exportar grid
    exportGridBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevenir comportamento padrão
        exportGrid();
    });
    
    // Função para atualizar configurações
    function updateConfig() {
        config.gridWidth = parseFloat(document.getElementById('grid-width').value) || 18;
        config.gridHeight = parseFloat(document.getElementById('grid-height').value) || 18;
        config.photoCount = parseInt(document.getElementById('photo-count').value) || 9;
        config.photoFormat = document.getElementById('photo-format').value;
        config.customWidth = parseFloat(document.getElementById('custom-width').value) || 3;
        config.customHeight = parseFloat(document.getElementById('custom-height').value) || 4;
        config.gridSpacing = parseFloat(document.getElementById('grid-spacing').value) || 2;
        config.gridLayout = document.getElementById('grid-layout').value;
        config.gridRows = parseInt(document.getElementById('grid-rows').value) || 3;
        config.gridColumns = parseInt(document.getElementById('grid-columns').value) || 3;
        config.exportFormat = document.getElementById('export-format').value;
        config.exportQuality = parseFloat(document.getElementById('export-quality').value) || 0.9;
        config.exportScale = parseFloat(document.getElementById('export-scale').value) || 2;
        config.exportFilename = document.getElementById('export-filename').value || 'meu_grid_de_fotos';
        
        // Atualizar display de tamanho do grid
        gridSizeDisplay.textContent = `${config.gridWidth} x ${config.gridHeight} cm`;
        
        // Calcular e exibir tamanho das fotos
        calculatePhotoSize();
    }
    
    // Função para calcular o tamanho das fotos com base nas configurações
    function calculatePhotoSize() {
        let photoWidth, photoHeight;
        
        // Determinar proporção da foto com base no formato
        let aspectRatio;
        switch(config.photoFormat) {
            case 'portrait-3x4':
                aspectRatio = 3/4;
                break;
            case 'portrait-5x7':
                aspectRatio = 5/7;
                break;
            case 'square':
                aspectRatio = 1;
                break;
            case 'custom':
                aspectRatio = config.customWidth / config.customHeight;
                break;
            default:
                aspectRatio = 3/4;
        }
        
        // Calcular layout do grid
        let rows, cols;
        if (config.gridLayout === 'auto') {
            // Calcular melhor layout baseado na quantidade de fotos
            const sqrtCount = Math.sqrt(config.photoCount);
            cols = Math.ceil(sqrtCount);
            rows = Math.ceil(config.photoCount / cols);
            
            // Ajustar para melhor proporção
            if ((cols - 1) * rows >= config.photoCount) {
                cols--;
            }
        } else {
            // Usar layout personalizado
            rows = config.gridRows;
            cols = config.gridColumns;
        }
        
        // Calcular espaço disponível considerando margens
        const spacingCm = config.gridSpacing / 10; // Converter mm para cm
        const availableWidth = config.gridWidth - (spacingCm * (cols - 1));
        const availableHeight = config.gridHeight - (spacingCm * (rows - 1));
        
        // Calcular tamanho máximo possível para cada foto
        const maxPhotoWidth = availableWidth / cols;
        const maxPhotoHeight = availableHeight / rows;
        
        // Determinar tamanho final respeitando a proporção
        if (maxPhotoWidth / maxPhotoHeight > aspectRatio) {
            // Limitado pela altura
            photoHeight = maxPhotoHeight;
            photoWidth = photoHeight * aspectRatio;
        } else {
            // Limitado pela largura
            photoWidth = maxPhotoWidth;
            photoHeight = photoWidth / aspectRatio;
        }
        
        // Atualizar display
        photoSizeDisplay.textContent = `${photoWidth.toFixed(2)} x ${photoHeight.toFixed(2)} cm`;
        
        return { 
            width: photoWidth, 
            height: photoHeight, 
            rows: rows, 
            cols: cols,
            aspectRatio: aspectRatio
        };
    }
    
    // Função para gerar o grid
    function generateGrid() {
        console.log("Gerando grid com configurações:", config);
        
        // Limpar grid existente
        photoGrid.innerHTML = '';
        
        // Remover mensagem de placeholder se existir
        const placeholderMessage = photoGrid.querySelector('.placeholder-message');
        if (placeholderMessage) {
            photoGrid.removeChild(placeholderMessage);
        }
        
        // Calcular tamanho das fotos e layout
        const photoSize = calculatePhotoSize();
        console.log("Tamanho calculado das fotos:", photoSize);
        
        // Configurar o grid CSS
        photoGrid.style.gridTemplateColumns = `repeat(${photoSize.cols}, 1fr)`;
        photoGrid.style.gridTemplateRows = `repeat(${photoSize.rows}, 1fr)`;
        
        // Calcular altura do grid para manter proporção
        const gridRatio = config.gridHeight / config.gridWidth;
        photoGrid.style.height = `${photoGrid.offsetWidth * gridRatio}px`;
        
        // Criar espaços para fotos
        for (let i = 0; i < config.photoCount; i++) {
            // Clonar template
            const photoSpace = document.importNode(photoSpaceTemplate.content, true).querySelector('.photo-space');
            
            // Definir proporção do espaço da foto
            photoSpace.style.aspectRatio = `${photoSize.aspectRatio}`;
            
            // Adicionar event listeners
            setupPhotoSpace(photoSpace);
            
            // Adicionar ao grid
            photoGrid.appendChild(photoSpace);
            console.log(`Espaço de foto ${i+1} adicionado ao grid`);
        }
        
        // Habilitar botão de exportação
        exportGridBtn.disabled = false;
    }
    
    // Configurar interatividade para cada espaço de foto
    function setupPhotoSpace(photoSpace) {
        const photoInput = photoSpace.querySelector('.photo-input');
        const photoPlaceholder = photoSpace.querySelector('.photo-placeholder');
        const photoContainer = photoSpace.querySelector('.photo-container');
        const photoPreview = photoSpace.querySelector('.photo-preview');
        const zoomInBtn = photoSpace.querySelector('.photo-zoom-in');
        const zoomOutBtn = photoSpace.querySelector('.photo-zoom-out');
        const rotateBtn = photoSpace.querySelector('.photo-rotate');
        const removeBtn = photoSpace.querySelector('.photo-remove');
        
        // Estado da foto
        const photoState = {
            zoom: 1,
            rotation: 0,
            posX: 0,
            posY: 0,
            dragging: false,
            startX: 0,
            startY: 0
        };
        
        // Abrir seletor de arquivo ao clicar no placeholder
        photoPlaceholder.addEventListener('click', function() {
            photoInput.click();
        });
        
        // Processar arquivo selecionado
        photoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Exibir preview da imagem
                    photoPreview.src = e.target.result;
                    photoContainer.style.display = 'block';
                    photoPlaceholder.style.display = 'none';
                    
                    // Resetar estado da foto
                    photoState.zoom = 1;
                    photoState.rotation = 0;
                    photoState.posX = 0;
                    photoState.posY = 0;
                    
                    updatePhotoTransform();
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Controles de zoom
        zoomInBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar propagação para o placeholder
            photoState.zoom *= 1.1;
            updatePhotoTransform();
        });
        
        zoomOutBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar propagação para o placeholder
            photoState.zoom *= 0.9;
            if (photoState.zoom < 0.1) photoState.zoom = 0.1;
            updatePhotoTransform();
        });
        
        // Controle de rotação
        rotateBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar propagação para o placeholder
            photoState.rotation += 90;
            if (photoState.rotation >= 360) photoState.rotation = 0;
            updatePhotoTransform();
        });
        
        // Remover foto
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar propagação para o placeholder
            photoPreview.src = '';
            photoContainer.style.display = 'none';
            photoPlaceholder.style.display = 'flex';
            photoInput.value = '';
        });
        
        // Arrastar para posicionar a foto
        photoPreview.addEventListener('mousedown', function(e) {
            photoState.dragging = true;
            photoState.startX = e.clientX - photoState.posX;
            photoState.startY = e.clientY - photoState.posY;
            photoPreview.style.cursor = 'grabbing';
            e.preventDefault(); // Prevenir seleção de texto
        });
        
        document.addEventListener('mousemove', function(e) {
            if (photoState.dragging) {
                photoState.posX = e.clientX - photoState.startX;
                photoState.posY = e.clientY - photoState.startY;
                updatePhotoTransform();
            }
        });
        
        document.addEventListener('mouseup', function() {
            if (photoState.dragging) {
                photoState.dragging = false;
                photoPreview.style.cursor = 'move';
            }
        });
        
        // Suporte para dispositivos touch
        photoPreview.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                photoState.dragging = true;
                photoState.startX = e.touches[0].clientX - photoState.posX;
                photoState.startY = e.touches[0].clientY - photoState.posY;
                e.preventDefault(); // Prevenir scroll
            }
        });
        
        document.addEventListener('touchmove', function(e) {
            if (photoState.dragging && e.touches.length === 1) {
                photoState.posX = e.touches[0].clientX - photoState.startX;
                photoState.posY = e.touches[0].clientY - photoState.startY;
                updatePhotoTransform();
                e.preventDefault(); // Prevenir scroll
            }
        });
        
        document.addEventListener('touchend', function() {
            photoState.dragging = false;
        });
        
        // Atualizar transformação da foto
        function updatePhotoTransform() {
            photoPreview.style.transform = `translate(-50%, -50%) translate(${photoState.posX}px, ${photoState.posY}px) scale(${photoState.zoom}) rotate(${photoState.rotation}deg)`;
        }
    }
    
    // Função para exportar o grid
    function exportGrid() {
        // Verificar se html2canvas está disponível
        if (typeof html2canvas !== 'function') {
            exportStatus.textContent = 'Erro: Biblioteca html2canvas não encontrada!';
            exportStatus.style.color = 'red';
            return;
        }
        
        // Mostrar status de processamento
        exportStatus.textContent = 'Processando...';
        exportStatus.style.color = 'blue';
        
        // Esconder controles durante a captura
        const controls = document.querySelectorAll('.photo-controls');
        controls.forEach(control => control.style.display = 'none');
        
        // Configurações para html2canvas
        const options = {
            scale: config.exportScale,
            useCORS: true, // Permitir imagens de outros domínios
            allowTaint: true, // Permitir imagens que podem "contaminar" o canvas
            backgroundColor: '#ffffff', // Fundo branco
            logging: false // Desativar logs
        };
        
        // Capturar o grid
        html2canvas(photoGrid, options).then(canvas => {
            // Restaurar controles
            controls.forEach(control => control.style.display = '');
            
            // Converter canvas para imagem
            let imageData;
            if (config.exportFormat === 'jpeg') {
                imageData = canvas.toDataURL('image/jpeg', config.exportQuality);
            } else {
                imageData = canvas.toDataURL('image/png');
            }
            
            // Criar link para download
            const link = document.createElement('a');
            link.href = imageData;
            link.download = `${config.exportFilename}.${config.exportFormat}`;
            
            // Simular clique para iniciar download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Atualizar status
            exportStatus.textContent = 'Exportação concluída com sucesso!';
            exportStatus.style.color = 'green';
            
            // Limpar status após 3 segundos
            setTimeout(() => {
                exportStatus.textContent = '';
            }, 3000);
        }).catch(error => {
            // Restaurar controles em caso de erro
            controls.forEach(control => control.style.display = '');
            
            // Mostrar erro
            console.error('Erro na exportação:', error);
            exportStatus.textContent = 'Erro na exportação. Verifique o console para detalhes.';
            exportStatus.style.color = 'red';
        });
    }
    
    // Inicialização
    updateConfig();
    
    // Mensagem de debug para confirmar carregamento
    console.log("Script do Gerador de Grid de Fotos carregado com sucesso!");
});

