// Variables globales para los gráficos
let deviceTypeChart = null;
let repeaterStatusChart = null;

// Navegación entre páginas
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
        });
        this.classList.add('active');
        
        // Mostrar página correspondiente
        const pageId = this.getAttribute('data-page') + '-page';
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('d-none');
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('d-none');
            
            // Cargar datos específicos de cada página
            setTimeout(() => {
                if (pageId === 'intermedio-page') {
                    console.log('🚀 Cargando datos intermedios...');
                    loadIntermediateData();
                } else if (pageId === 'avanzado-page') {
                    console.log('🚀 Cargando datos avanzados...');
                    loadAdvancedData();
                }
            }, 100);
        }
    });
});

// Función para obtener datos del dashboard (ahora devuelve datos fijos)
async function fetchDashboardData() {
    try {
        const fixedData = {
            "metrics": {
                "nDevices": 1148,
                "nReps": 957,
                "TDispo": "98.5%",
                "AnchoBanda": "2.4 Gbps"
            },
            "charts": {
                "device_types": {
                    "Smartphones": 45,
                    "Laptops": 25,
                    "Tablets": 15,
                    "IoT": 10,
                    "Otros": 5
                },
                "repeater_status": {
                    "Óptimo": 650,
                    "Bueno": 250,
                    "Regular": 50,
                    "Crítico": 7
                }
            },
            "timestamp": Date.now()
        };
        
        return fixedData;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return null;
    }
}

// Función para actualizar las métricas principales
function updateMetrics(data) {
    if (data && data.metrics) {
        document.getElementById('metric-devices').textContent = data.metrics.nDevices.toLocaleString();
        document.getElementById('metric-reps').textContent = data.metrics.nReps;
        
        const heatmapDeviceCount = document.getElementById('heatmap-device-count');
        const heatmapApCount = document.getElementById('heatmap-ap-count');
        
        if (heatmapDeviceCount) {
            heatmapDeviceCount.textContent = data.metrics.nDevices.toLocaleString();
        }
        if (heatmapApCount) {
            heatmapApCount.textContent = data.metrics.nReps;
        }
    }
}

// FUNCIÓN PARA DATOS INTERMEDIOS
async function loadIntermediateData() {
    try {
        console.log('🔄 Cargando datos intermedios...');
        
        const loadingIndicator = document.getElementById('loading-indicator-intermedio');
        const metricsContainer = document.getElementById('metrics-container-intermedio');
        
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (metricsContainer) metricsContainer.style.display = 'flex';
        
        await loadHeatmapIntermedio();
        preloadIntermedioImage();
        
        console.log('✅ Datos intermedios cargados correctamente');
        
    } catch (error) {
        console.error('Error loading intermediate data:', error);
        const loadingIndicator = document.getElementById('loading-indicator-intermedio');
        if (loadingIndicator) {
            loadingIndicator.innerHTML = 
                '<i class="fas fa-exclamation-triangle me-2"></i>Error cargando datos: ' + error.message;
        }
    }
}

// FUNCIÓN PARA PRECARGAR IMAGEN INTERMEDIO
function preloadIntermedioImage() {
    const img = new Image();
    img.src = "/static/img/5.png";
    img.onload = function() {
        console.log('✅ Imagen intermedio cargada:', this.src);
    };
    img.onerror = function() {
        console.warn('⚠️ No se pudo cargar la imagen intermedio:', this.src);
        const fallbackImg = new Image();
        fallbackImg.src = "/static/img/5.jpeg";
    };
}

// FUNCIÓN PARA HEATMAP INTERMEDIO
async function loadHeatmapIntermedio() {
    const intermedioPage = document.getElementById('intermedio-page');
    if (!intermedioPage) {
        console.error('❌ No se encontró la página intermedio');
        return;
    }
    
    const heatmapContainer = intermedioPage.querySelector('.heatmap-container');
    const placeholder = intermedioPage.querySelector('.heatmap-placeholder');
    
    if (!heatmapContainer || !placeholder) {
        console.error('❌ No se encontraron elementos del heatmap intermedio');
        return;
    }
    
    try {
        console.log('🔄 Solicitando heatmap intermedio...');
        placeholder.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 mb-0">Cargando mapa de calor intermedio...</p>
            </div>
        `;
        
        const response = await fetch('/api/heatmap-intermedio');
        console.log('📡 Respuesta del servidor:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        
        if (data.success && data.map_html) {
            console.log('✅ Heatmap intermedio recibido correctamente');
            
            placeholder.style.display = 'none';
            
            const mapDiv = document.createElement('div');
            mapDiv.id = 'heatmap-intermedio-real';
            mapDiv.innerHTML = data.map_html;
            
            heatmapContainer.innerHTML = '';
            heatmapContainer.appendChild(mapDiv);
            
            console.log('✅ Heatmap Intermedio integrado en el DOM');
            
            setTimeout(() => {
                reinitializeMapIntermedio();
            }, 1000);
            
        } else {
            console.error('❌ Error en la respuesta del servidor:', data.error);
            throw new Error(data.error || 'Error desconocido del servidor');
        }
        
    } catch (error) {
        console.error('❌ Error cargando heatmap intermedio:', error);
        placeholder.innerHTML = `
            <div class="text-center text-danger">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h5>Error cargando el mapa intermedio</h5>
                <p class="small">${error.message}</p>
                <p class="small">Verifica la consola para más detalles</p>
                <button class="btn btn-sm btn-outline-primary mt-2" onclick="loadHeatmapIntermedio()">
                    <i class="fas fa-redo me-1"></i>Reintentar
                </button>
            </div>
        `;
        placeholder.style.display = 'block';
    }
}

// Función para reajustar el mapa intermedio
function reinitializeMapIntermedio() {
    const intermedioPage = document.getElementById('intermedio-page');
    if (!intermedioPage) return;
    
    const iframe = intermedioPage.querySelector('#heatmap-intermedio-real iframe');
    const foliumMap = intermedioPage.querySelector('#heatmap-intermedio-real .folium-map');
    const leafletContainer = intermedioPage.querySelector('#heatmap-intermedio-real .leaflet-container');
    
    if (iframe) {
        console.log('🔄 Reajustando iframe intermedio...');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.minHeight = '600px';
        iframe.style.border = 'none';
        iframe.style.aspectRatio = '16/9';
        
        iframe.onload = function() {
            console.log('✅ Iframe intermedio completamente cargado');
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 500);
        };
    }
    
    if (foliumMap) {
        console.log('🔄 Reajustando mapa Folium intermedio...');
        foliumMap.style.width = '100%';
        foliumMap.style.height = '100%';
        foliumMap.style.minHeight = '600px';
        foliumMap.style.aspectRatio = '16/9';
    }
    
    if (leafletContainer) {
        console.log('🔄 Reajustando contenedor Leaflet...');
        leafletContainer.style.width = '100%';
        leafletContainer.style.height = '100%';
        leafletContainer.style.minHeight = '600px';
        leafletContainer.style.aspectRatio = '16/9';
    }
    
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
    
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 500);
    
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 1000);
}

// 🔥 FUNCIÓN PARA CARGAR DATOS AVANZADOS (INTERFAZ DE CHAT)
async function loadAdvancedData() {
    try {
        console.log('🚀 Inicializando interfaz de chat avanzado...');
        
        // Verificar que los elementos existen
        const chatMessages = document.getElementById('chatbot-messages');
        const chatInput = document.getElementById('chatbot-input');
        const sendButton = document.getElementById('chatbot-send');
        
        console.log('🔍 Elementos encontrados:', {
            chatMessages: !!chatMessages,
            chatInput: !!chatInput,
            sendButton: !!sendButton
        });
        
        if (!chatMessages || !chatInput || !sendButton) {
            console.error('❌ No se encontraron todos los elementos del chat');
            console.error('chatbot-messages:', chatMessages);
            console.error('chatbot-input:', chatInput);
            console.error('chatbot-send:', sendButton);
            return;
        }

        // Establecer hora del mensaje de bienvenida
        const welcomeTime = document.getElementById('welcome-time');
        if (welcomeTime) {
            welcomeTime.textContent = new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        // Inicializar el chatbot inmediatamente
        initializeAdvancedChatbot();
        
        console.log('✅ Chatbot avanzado inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error loading advanced data:', error);
    }
}

// 🔥 FUNCIONES DEL CHATBOT PARA LA INTERFAZ AVANZADA
function initializeAdvancedChatbot() {
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');

    console.log('🔄 Inicializando chatbot avanzado...');
    console.log('📋 Elementos encontrados:', {
        sendBtn: !!sendBtn,
        input: !!input,
        messagesContainer: !!messagesContainer
    });

    if (!sendBtn || !input || !messagesContainer) {
        console.error('❌ Faltan elementos esenciales del chatbot');
        return;
    }

    // Enviar mensaje al hacer clic
    sendBtn.addEventListener('click', function() {
        console.log('🖱️ Botón de enviar clickeado');
        sendAdvancedMessage();
    });

    // Enviar mensaje con Enter
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('⌨️ Tecla Enter presionada');
            sendAdvancedMessage();
        }
    });

    // Focus automático en el input
    input.focus();
    console.log('✅ Focus en input establecido');

    console.log('✅ Chatbot avanzado completamente inicializado');
}

async function sendAdvancedMessage() {
    console.log('📤 Iniciando envío de mensaje...');
    
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');
    const message = input.value.trim();

    console.log('💬 Mensaje a enviar:', message);

    if (!message) {
        console.log('⚠️ Mensaje vacío, no se envía');
        return;
    }

    // Agregar mensaje del usuario
    addAdvancedMessage(message, 'user');
    input.value = '';

    // Mostrar indicador de escritura
    const typingIndicator = addTypingIndicator();

    try {
        console.log('🔄 Obteniendo respuesta del chatbot...');
        // Obtener respuesta del backend
        const response = await getChatbotResponse(message);
        
        // Remover indicador de escritura
        removeTypingIndicator(typingIndicator);
        
        // Agregar respuesta del bot
        addAdvancedMessage(response, 'bot');
        
    } catch (error) {
        // Remover indicador de escritura
        removeTypingIndicator(typingIndicator);
        
        // Agregar mensaje de error
        addAdvancedMessage('Lo siento, hubo un error al procesar tu solicitud. Inténtalo de nuevo.', 'bot');
        console.error('❌ Chatbot error:', error);
    }

    // Scroll al final
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    console.log('✅ Mensaje procesado correctamente');
}

function addAdvancedMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) {
        console.error('❌ No se encontró el contenedor de mensajes');
        return null;
    }

    const messageDiv = document.createElement('div');
    
    const timestamp = new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${formatMessage(text)}</div>
            <div class="message-time">${timestamp}</div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.log(`✅ Mensaje ${sender} agregado:`, text.substring(0, 50) + '...');
    return messageDiv;
}

function addTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) {
        console.error('❌ No se encontró el contenedor de mensajes para el indicador');
        return null;
    }

    const typingDiv = document.createElement('div');
    
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="spinner-border spinner-border-sm text-success me-2" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <em>El asistente está escribiendo...</em>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.log('✅ Indicador de escritura agregado');
    return typingDiv;
}

function removeTypingIndicator(typingElement) {
    if (typingElement && typingElement.parentNode) {
        typingElement.parentNode.removeChild(typingElement);
        console.log('✅ Indicador de escritura removido');
    }
}

function formatMessage(text) {
    // Formatear texto con saltos de línea y listas
    return text.replace(/\n/g, '<br>')
               .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Función para obtener respuesta del chatbot (compartida)
async function getChatbotResponse(userMessage) {
    // Convertir el mensaje del usuario a minúsculas para facilitar la comparación
    const message = userMessage.toLowerCase();
    
    try {
        // Consultar diferentes endpoints según la pregunta
        if (message.includes('estado') || message.includes('estadística') || message.includes('general')) {
            const response = await fetch('/api/network-stats');
            const data = await response.json();
            return `📊 **Estado de la Red:**\n- APs Totales: ${data.nAPs || 'N/A'}\n- Dispositivos: ${data.nDevices || 'N/A'}\n- Registros: ${data.nRecords || 'N/A'}`;
            
        } else if (message.includes('dashboard') || message.includes('datos') || message.includes('métrica')) {
            const response = await fetch('/api/dashboard-data');
            const data = await response.json();
            const metrics = data.metrics;
            return `📈 **Métricas del Dashboard:**\n- APs Totales: ${metrics.nDevices}\n- APs Activos: ${metrics.nReps}\n- Disponibilidad: ${metrics.TDispo}\n- Ancho de Banda: ${metrics.AnchoBanda}`;
            
        } else if (message.includes('columna') || message.includes('estructura') || message.includes('campo')) {
            const response = await fetch('/debug/columns');
            const data = await response.json();
            return `🗂️ **Estructura de Datos:**\n**APs:** ${data.aps_columns?.join(', ') || 'No disponible'}\n**Clientes:** ${data.clients_columns?.join(', ') || 'No disponible'}`;
            
        } else if (message.includes('cliente') || message.includes('usuario') || message.includes('dispositivo')) {
            const response = await fetch('/api/network-stats');
            const data = await response.json();
            return `👥 **Información de Clientes:**\n- Total de dispositivos: ${data.nDevices || 'N/A'}\n- Clientes únicos: ${data.nClients || 'N/A'}`;
            
        } else if (message.includes('ap') || message.includes('punto de acceso') || message.includes('access point')) {
            const response = await fetch('/api/network-stats');
            const data = await response.json();
            return `📡 **Información de APs:**\n- APs totales: ${data.nAPs || 'N/A'}\n- APs activos: ${data.activeAPs || 'N/A'}`;
            
        } else if (message.includes('analizar') || message.includes('análisis') || message.includes('analyze')) {
            const response = await fetch('/api/analyze');
            const data = await response.json();
            return `🔍 **Análisis Avanzado:**\n${data.message || 'Análisis completado'}\nEstado: ${data.status || 'Completado'}`;
            
        } else if (message.includes('hola') || message.includes('hi') || message.includes('hello')) {
            return '¡Hola! 👋 Soy tu asistente de análisis WiFi. Puedo ayudarte con:\n- Estado de la red\n- Métricas del dashboard\n- Estructura de datos\n- Información de APs y clientes\n- Análisis avanzado\n\n¿En qué puedo ayudarte?';
            
        } else if (message.includes('ayuda') || message.includes('help')) {
            return '💡 **Puedes preguntarme sobre:**\n• "estado de la red"\n• "métricas del dashboard"  \n• "estructura de datos"\n• "clientes conectados"\n• "APs activos"\n• "análisis avanzado"\n\n¡Solo pregúntame!';
            
        } else {
            return '🤔 No estoy seguro de entender tu pregunta. Intenta con:\n- "estado de la red"\n- "métricas del dashboard"\n- "estructura de datos"\n- "clientes conectados"\n- "APs activos"\n\nO escribe "ayuda" para más opciones.';
        }
        
    } catch (error) {
        console.error('Error en chatbot:', error);
        return '❌ Lo siento, hubo un error al consultar los datos. Verifica que el servidor esté funcionando correctamente.';
    }
}

// Función principal para cargar todos los datos (ROOKIE)
async function loadAllData() {
    try {
        // Ocultar indicador de carga y mostrar métricas inmediatamente
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('metrics-container').style.display = 'flex';
        
        // CARGAR EL HEATMAP PARA ROOKIE
        setTimeout(() => {
            loadHeatmapRookie();
        }, 1000);
        
        console.log('✅ Dashboard Rookie cargado correctamente');
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loading-indicator').innerHTML = 
            '<i class="fas fa-exclamation-triangle me-2"></i>Error cargando datos: ' + error.message;
    }
}

// Función para cargar heatmap principal (ROOKIE)
async function loadHeatmapRookie() {
    const rookiePage = document.getElementById('rookie-page');
    if (!rookiePage) return;
    
    const heatmapContainer = rookiePage.querySelector('.heatmap-container');
    const placeholder = rookiePage.querySelector('.heatmap-placeholder');
    
    if (!heatmapContainer || !placeholder) return;
    
    try {
        placeholder.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 mb-0">Cargando mapa de calor...</p>
            </div>
        `;
        
        const response = await fetch('/api/heatmap');
        const data = await response.json();
        
        if (data.success && data.map_html) {
            placeholder.style.display = 'none';
            
            const mapDiv = document.createElement('div');
            mapDiv.id = 'heatmap-real';
            mapDiv.innerHTML = data.map_html;
            
            heatmapContainer.innerHTML = '';
            heatmapContainer.appendChild(mapDiv);
            
            console.log('✅ Heatmap Rookie cargado correctamente');
            
            setTimeout(() => {
                reinitializeMapRookie();
            }, 1000);
            
        } else {
            throw new Error(data.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('❌ Error cargando heatmap rookie:', error);
        placeholder.innerHTML = `
            <div class="text-center text-danger">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h5>Error cargando el mapa</h5>
                <p class="small">${error.message}</p>
                <button class="btn btn-sm btn-outline-primary mt-2" onclick="loadHeatmapRookie()">
                    <i class="fas fa-redo me-1"></i>Reintentar
                </button>
            </div>
        `;
        placeholder.style.display = 'block';
    }
}

function reinitializeMapRookie() {
    const rookiePage = document.getElementById('rookie-page');
    if (!rookiePage) return;
    
    const iframe = rookiePage.querySelector('#heatmap-real iframe');
    const foliumMap = rookiePage.querySelector('#heatmap-real .folium-map');
    
    if (iframe) {
        console.log('🔄 Reajustando iframe rookie...');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.minHeight = '600px';
        iframe.style.border = 'none';
        
        iframe.onload = function() {
            console.log('✅ Iframe rookie completamente cargado');
        };
    }
    
    if (foliumMap) {
        console.log('🔄 Reajustando mapa Folium rookie...');
        foliumMap.style.width = '100%';
        foliumMap.style.height = '100%';
        foliumMap.style.minHeight = '600px';
    }
    
    window.dispatchEvent(new Event('resize'));
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando dashboard...');
    
    // Cargar datos iniciales solo para la página activa (Rookie)
    loadAllData();
    
    console.log('📦 Dashboard inicializado - Las otras páginas se cargarán bajo demanda');
});