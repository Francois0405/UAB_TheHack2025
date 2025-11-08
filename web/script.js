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
        document.getElementById(pageId).classList.remove('d-none');
    });
});

// Inicializar gráficos cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Gráfico de tipos de dispositivos
    const deviceTypeCtx = document.getElementById('deviceTypeChart').getContext('2d');
    const deviceTypeChart = new Chart(deviceTypeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Smartphones', 'Laptops', 'Tablets', 'IoT', 'Otros'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    '#00843D',
                    '#28a745',
                    '#20c997',
                    '#0dcaf0',
                    '#6c757d'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });

    // Gráfico de estado de repetidores
    const repeaterStatusCtx = document.getElementById('repeaterStatusChart').getContext('2d');
    const repeaterStatusChart = new Chart(repeaterStatusCtx, {
        type: 'bar',
        data: {
            labels: ['Óptimo', 'Bueno', 'Regular', 'Crítico'],
            datasets: [{
                label: 'Repetidores',
                data: [850, 300, 80, 15],
                backgroundColor: [
                    '#00843D',
                    '#28a745',
                    '#ffc107',
                    '#dc3545'
                ],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Repetidores'
                    },
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Simular datos en tiempo real (para demostración)
    function updateMetrics() {
        // Esta función podría conectarse a una API real en el futuro
        const devicesElement = document.querySelector('.metric-card:nth-child(1) .metric-value');
        const currentDevices = parseInt(devicesElement.textContent.replace(/,/g, ''));
        
        // Simular pequeñas fluctuaciones en los datos
        const fluctuation = Math.floor(Math.random() * 100) - 50;
        const newDevices = Math.max(42000, currentDevices + fluctuation);
        
        devicesElement.textContent = newDevices.toLocaleString();
    }

    // Actualizar métricas cada 10 segundos (solo para demostración)
    setInterval(updateMetrics, 10000);
});

// Función para integrar el mapa de calor de Python
function integrateHeatmap(heatmapElement) {
    // Esta función sería llamada cuando tengas tu mapa de calor de Python listo
    const placeholder = document.querySelector('.heatmap-placeholder');
    placeholder.innerHTML = '';
    placeholder.appendChild(heatmapElement);
    console.log('Mapa de calor integrado correctamente');
}

// Ejemplo de uso cuando tengas tu mapa de calor:
// integrateHeatmap(tuElementoDeMapaDeCalor);