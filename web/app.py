from flask import Flask, render_template, jsonify, send_file

import json

import time

import os



# Importa SOLO lo necesario desde init

try:

    from init import app, init_data, get_network_data, analyze_data

    print("✅ Módulos importados correctamente")

except ImportError as e:

    print(f"❌ Error importando módulos: {e}")

    # Crea una app Flask básica como fallback

    app = Flask(__name__)



# Inicializar datos al arrancar la aplicación

try:

    print("🔄 Inicializando datos...")

    df_aps, df_clients = init_data()

    print("✅ Datos inicializados correctamente")

except Exception as e:

    print(f"❌ Error inicializando datos: {e}")

    df_aps, df_clients = None, None



@app.route("/")

def index():

    try:

        network_data = get_network_data()

        return render_template("index.html", 

                             aps=network_data.get('nAPs', 0), 

                             cli=network_data.get('nDevices', 0),

                             network_data=network_data)

    except Exception as e:

        return render_template("index.html", 

                             aps=0, 

                             cli=0,

                             error=str(e))



@app.route("/api/network-stats")

def network_stats():

    try:

        return jsonify(get_network_data())

    except Exception as e:

        return jsonify({"error": str(e)})



@app.route("/api/dashboard-data")

def dashboard_data():

    """Endpoint que devuelve todos los datos para el dashboard"""

    try:

        network_data = get_network_data()

        

        # Datos para los gráficos (usando datos reales cuando sea posible)

        dashboard_data = {

            "metrics": {

                "nDevices": network_data.get('nDevices', 1245),

                "nReps": network_data.get('nAPs', 42),

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

                    "Óptimo": 850,

                    "Bueno": 300,

                    "Regular": 80,

                    "Crítico": 15

                }

            },

            "raw_data": network_data,

            "timestamp": time.time()

        }

        

        return jsonify(dashboard_data)

        

    except Exception as e:

        return jsonify({

            "metrics": {

                "nDevices": 0,

                "nReps": 0,

                "TDispo": "0%",

                "AnchoBanda": "0 Gbps"

            },

            "charts": {

                "device_types": {},

                "repeater_status": {}

            },

            "error": str(e),

            "timestamp": time.time()

        })



@app.route("/api/health")

def health_check():

    """Endpoint para verificar que la API está funcionando"""

    return jsonify({

        "status": "healthy",

        "timestamp": time.time(),

        "message": "API funcionando correctamente"

    })



@app.route("/api/analyze")

def analyze():

    try:

        result = analyze_data()

        return jsonify(result)

    except Exception as e:

        return jsonify({"status": "error", "message": str(e)})



# 🔥 NUEVOS ENDPOINTS PARA HEATMAPS DEL NIVEL INTERMEDIO



@app.route("/api/heatmap")

def serve_heatmap():

    """Heatmap para nivel Rookie - APs"""

    try:

        heatmap_path = "templates/heatmap_APs.html"

        

        if os.path.exists(heatmap_path):

            iframe_html = f"""

            <iframe 

                src="/heatmap-standalone/aps" 

                style="width: 100%; height: 100%; min-height: 600px; border: none; border-radius: 10px;"

                onload="console.log('✅ Heatmap APs cargado correctamente')"

            ></iframe>

            """

            

            return jsonify({

                "success": True,

                "map_html": iframe_html,

                "message": "Heatmap APs cargado via iframe"

            })

        else:

            return jsonify({

                "success": False,

                "error": f"Archivo {heatmap_path} no encontrado",

                "map_html": get_fallback_heatmap("APs")

            })

            

    except Exception as e:

        print(f"❌ Error con heatmap APs: {e}")

        return jsonify({

            "success": False,

            "error": str(e),

            "map_html": get_error_heatmap(str(e))

        })



@app.route("/api/heatmap-intermedio")

def serve_heatmap_intermedio():

    """Heatmap para nivel Intermedio"""

    try:

        heatmap_path = "templates/heatmap_capas_horas.html"

        

        if os.path.exists(heatmap_path):

            iframe_html = f"""

            <iframe 

                src="/heatmap-standalone/intermedio" 

                style="width: 100%; height: 100%; min-height: 600px; border: none; border-radius: 10px;"

                onload="console.log('✅ Heatmap Intermedio cargado correctamente')"

            ></iframe>

            """

            

            return jsonify({

                "success": True,

                "map_html": iframe_html,

                "message": "Heatmap Intermedio cargado via iframe"

            })

        else:

            return jsonify({

                "success": False,

                "error": f"Archivo {heatmap_path} no encontrado",

                "map_html": get_fallback_heatmap("Intermedio")

            })

            

    except Exception as e:

        print(f"❌ Error con heatmap intermedio: {e}")

        return jsonify({

            "success": False,

            "error": str(e),

            "map_html": get_error_heatmap(str(e))

        })



@app.route("/api/heatmap-signal")

def serve_heatmap_signal():

    """Heatmap para nivel Intermedio - Intensidad de Señal"""

    try:

        # Puedes usar un archivo diferente o el mismo con diferentes parámetros

        heatmap_path = "templates/heatmap_signal.html"

        

        if os.path.exists(heatmap_path):

            iframe_html = f"""

            <iframe 

                src="/heatmap-standalone/signal" 

                style="width: 100%; height: 100%; min-height: 600px; border: none; border-radius: 10px;"

                onload="console.log('✅ Heatmap Señal cargado correctamente')"

            ></iframe>

            """

            

            return jsonify({

                "success": True,

                "map_html": iframe_html,

                "message": "Heatmap Intensidad de Señal cargado"

            })

        else:

            # Fallback al heatmap principal si no existe el específico

            return serve_heatmap()

            

    except Exception as e:

        print(f"❌ Error con heatmap señal: {e}")

        return jsonify({

            "success": False,

            "error": str(e),

            "map_html": get_error_heatmap(str(e))

        })



@app.route("/api/heatmap-density")

def serve_heatmap_density():

    """Heatmap para nivel Intermedio - Densidad de Usuarios"""

    try:

        heatmap_path = "templates/heatmap_density.html"

        

        if os.path.exists(heatmap_path):

            iframe_html = f"""

            <iframe 

                src="/heatmap-standalone/density" 

                style="width: 100%; height: 100%; min-height: 600px; border: none; border-radius: 10px;"

                onload="console.log('✅ Heatmap Densidad cargado correctamente')"

            ></iframe>

            """

            

            return jsonify({

                "success": True,

                "map_html": iframe_html,

                "message": "Heatmap Densidad de Usuarios cargado"

            })

        else:

            # Fallback al heatmap principal

            return serve_heatmap()

            

    except Exception as e:

        print(f"❌ Error con heatmap densidad: {e}")

        return jsonify({

            "success": False,

            "error": str(e),

            "map_html": get_error_heatmap(str(e))

        })



@app.route("/heatmap-standalone/<tipo>")

def heatmap_standalone(tipo):

    """Sirve diferentes heatmaps según el tipo"""

    try:

        if tipo == "aps":

            return send_file("templates/heatmap_APs.html")

        elif tipo == "intermedio":

            # Usa heatmap2.html para el nivel intermedio

            heatmap_path = "templates/heatmap_capas_horas.html"

            if os.path.exists(heatmap_path):

                return send_file(heatmap_path)

            else:

                # Fallback al heatmap principal si no existe heatmap2.html

                return send_file("templates/heatmap_APs.html")

        elif tipo == "signal":

            # Intenta cargar el heatmap de señal, si no existe usa el principal

            heatmap_path = "templates/heatmap_signal.html"

            if os.path.exists(heatmap_path):

                return send_file(heatmap_path)

            else:

                return send_file("templates/heatmap_APs.html")

        elif tipo == "density":

            # Intenta cargar el heatmap de densidad, si no existe usa el principal

            heatmap_path = "templates/heatmap_density.html"

            if os.path.exists(heatmap_path):

                return send_file(heatmap_path)

            else:

                return send_file("templates/heatmap_APs.html")

        else:

            return send_file("templates/heatmap_APs.html")

    except Exception as e:

        return f"""

        <html>

            <body style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8f9fa;">

                <div style="text-align: center; color: #dc3545;">

                    <i class="fas fa-exclamation-triangle fa-3x"></i>

                    <h3>Error cargando el mapa {tipo}</h3>

                    <p>{str(e)}</p>

                </div>

            </body>

        </html>

        """



def get_fallback_heatmap(tipo="APs"):

    """Heatmap de respaldo cuando no se encuentra el archivo"""

    return f"""

    <div style="width: 100%; height: 600px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 10px;">

        <div style="text-align: center; color: #6c757d;">

            <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem; color: #00843D;"></i>

            <h4>Mapa de Calor - {tipo}</h4>

            <p>Archivo heatmap específico no encontrado</p>

            <p class="small">Genera el heatmap con tu script de Python</p>

        </div>

    </div>

    """



def get_error_heatmap(error_msg):

    """Heatmap de error"""

    return f"""

    <div style="width: 100%; height: 600px; display: flex; align-items: center; justify-content: center; background: #fff5f5; border-radius: 10px;">

        <div style="text-align: center; color: #e53e3e;">

            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>

            <h4>Error cargando el mapa</h4>

            <p class="small">{error_msg}</p>

            <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadHeatmap()">

                <i class="fas fa-redo me-1"></i>Reintentar

            </button>

        </div>

    </div>

    """

@app.route("/api/chatbot")
def chatbot_query():
    """Endpoint para consultas del chatbot"""
    try:
        # Aquí puedes procesar consultas más complejas
        return jsonify({
            "status": "success",
            "message": "Consulta procesada correctamente",
            "timestamp": time.time()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route("/debug/columns")

def debug_columns():

    """Endpoint para debug - muestra las columnas reales de los datos"""

    try:

        df_aps, df_clients = init_data()

        return jsonify({

            "aps_columns": df_aps.columns.tolist() if df_aps is not None else "No cargado",

            "clients_columns": df_clients.columns.tolist() if df_clients is not None else "No cargado",

            "aps_sample": df_aps.head(2).to_dict('records') if df_aps is not None else "No cargado",

            "clients_sample": df_clients.head(2).to_dict('records') if df_clients is not None else "No cargado"

        })

    except Exception as e:

        return jsonify({"error": str(e)})



if __name__ == "__main__":

    print("🚀 Iniciando servidor Flask...")

    print("📊 Verifica que los endpoints funcionen:")

    print("   http://localhost:5000/")

    print("   http://localhost:5000/api/health")

    print("   http://localhost:5000/api/dashboard-data")

    print("   http://localhost:5000/api/heatmap-signal")

    print("   http://localhost:5000/api/heatmap-density")

    app.run(debug=True, host='0.0.0.0', port=5000)