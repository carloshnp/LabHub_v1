#!/usr/bin/python
# -*- coding: latin-1 -*-



##### PRECISA DAS DLLS #####
# Cornerstone.dll
# CyUSB.dll
############################



# import clr
# clr.AddReference("Cornerstone")
# import CornerstoneDll
# mono = CornerstoneDll.Cornerstone(True)
# if not mono.connect():
#    raise IOError( 'Monochromator not found' )
# mono.sendCommand("GRAT?")
# mono.getResponse()
# ## Resposta-->   '2,600,1000\r\n\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00 - Loops = 1'
# mono.sendCommand("WAVE?")
# mono.getResponse()
# ## Resposta-->   '2590.734\r\n\r\nments, Cornerstone 260, SN694,V04.40\r\n\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00 - Loops = 1'

# CONFERIR COMO O LOCKIN ESTÁ CONECTADO NO PC PARA FAZER A LEITURA. CONECTAR VIA GPIB OU VIA DAQ DA NI?

import sys
import pyvisa
import time
import numpy as np
import clr

try:
    # Use PyQt5 if present
    from PyQt5.QtWidgets import QMainWindow, QApplication, QMessageBox, QFileDialog
    from PyQt5 import uic
    import matplotlib
    matplotlib.use("Qt5Agg")
    from GUI.Monocromador_GUI_qt5 import Ui_MainWindow
    print("Running Example with PyQt5...")
    QTVersion = 5
except:
    # Else, use PyQt4
    from PyQt4.QtGui import QMainWindow, QApplication, QMessageBox
    from GUI.Monocromador_GUI_qt4 import Ui_MainWindow
    print("Running Example with PyQt4...")
    # barra de ferramentas no grafico
    from matplotlib.backends.backend_qt4 import NavigationToolbar2QT as NavigationToolbar
    # import the Qt4Agg FigureCanvas object, that binds Figure to
    # Qt4Agg backend. It also inherits from QWidget
    from matplotlib.backends.backend_qt4agg import FigureCanvasQTAgg as FigureCanvas
    QTVersion = 4

###############
# COMUNICACAO #
###############

# iniciando os DLLs do Cornerstone conectado via USB
clr.AddReference("Cornerstone")
import CornerstoneDll
MONO = CornerstoneDll.Cornerstone(True)
if not MONO.connect():
    NoConnWinTitle = "Sem conexão com o monocromador"
    NoConnWinText = "Conecte a USB e ligue o equipamento."
    print("Can't connect to monocromator")
    app2 = QApplication(sys.argv)
    QMessageBox.critical(None , NoConnWinTitle, NoConnWinText)

#GPIB do Lock in SR530 tem que estar ajustado para 23
rm = pyvisa.ResourceManager()
try :
    SRS530 = rm.open_resource("GPIB::23",timeout=5000)
except:
    NoConnWinTitle = "Sem conexão com Lock In"
    NoConnWinText = "Conecte o lock in via GPIB e ligue o equipamento."
    print("Can't connect to GPIB equipments")
    app3 = QApplication(sys.argv)
    QMessageBox.critical(None , NoConnWinTitle, NoConnWinText)
    sys.exit()

#####################
# Variáveis Globais #
#####################

wait_time_monocromador = 0.3

#Lista de tempos de integracao do lockin
Pre_Time = [0.001,0.003,0.010,0.030,0.100,0.300,1.,3.,10.,30.,100.]
Post_Time = [0.,0.1,1.]
Sens_List = ["10 nV", "20 nV", "50 nV", "100 nV", "200 nV", "500 nV", "1 uV", "2 uV", "5 uV", "10 uV", "20 uV", "50 uV", "100 uV", "200 uV", "500 uV", "1 mV", "2 mV", "5 mV", "10 mV", "20 mV", "50 mV", "100 mV", "200 mV", "500 mV"]
Sens_Val = [0.00000001, 0.00000002, 0.00000005, 0.0000001, 0.0000002, 0.0000005, 0.000001, 0.000002, 0.000005, 0.00001, 0.00002, 0.00005, 0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5]

WaitTimePre = 0
WaitTimePost = 0
WaitTime = 0
InterMeasureTime = 0
Medindo = 0
Parar = 0
Pausa = 0
Fim = 1
Filtro = 0
PosicaoReal = []
MedidaMean = []
MedidaStd = []
Dados = ""

class DesignerMainWindow(QMainWindow):

##########
# BOTOES #
##########

    def __init__(self, parent=None):
        # super(DesignerMainWindow, self).__init__(parent) # antes de usar o uic.loadUi()
        super(DesignerMainWindow, self).__init__() # Call the inherited classes __init__ method
        uic.loadUi('GUI\\Monocromador_GUI_2.ui', self) # Load the .ui file
        

        # self.setupUi(self)

        #Inclui a funcao dos botoes
        # Medidas
        self.Medir_btn.clicked.connect(self.MEDIR)
        self.EstimarTempo_btn.clicked.connect(self.EstimarTempo)
        self.Parar_btn.clicked.connect(self.PararMedida)
        self.Continuar_btn.clicked.connect(self.ContinuarMedida)
        self.Suspender_btn.clicked.connect(self.SuspenderMedida)
        self.Salvar_btn.clicked.connect(self.SalvarMedida)

        # Monocromador
        self.MudaGrade_btn.clicked.connect(self.MUDAGRADE)
        self.GoTo_btn.clicked.connect(self.GOTO)
        self.PuloMais_btn.clicked.connect(self.PuloMais)
        self.PuloMenos_btn.clicked.connect(self.PuloMenos)
        self.Stb_btn.clicked.connect(self.Status_byte_e_erro)


        # LOCKIN
        #     Tempo de integracao
        self.PreMais_btn.clicked.connect(self.PreMais)
        self.PreMenos_btn.clicked.connect(self.PreMenos)
        self.PostMais_btn.clicked.connect(self.PostMais)
        self.PostMenos_btn.clicked.connect(self.PostMenos)
        #    Sensibilidade
        self.SensMais_btn.clicked.connect(self.SensMais)
        self.SensMenos_btn.clicked.connect(self.SensMenos)

#################
# INICIALIZACAO #
#################

        #    ler a grade atual e atualizar a janela
        self.AtualizaGrade()
        self.AtualizaPosicao()

        #    Adquire o indice do tempo integracao do lockin
        SRS530.write("T 1 ,6")
        self.Tempos()

        #    Zera o tempo estimado e o total
        self.TempoEst_txt.setText("0 s")
        self.TempoTot_txt.setText("0 s")

        #    Adquire a sensibilidade do LockIn
        Sens = int(SRS530.query("G"))
        self.Sens_txt.setText(Sens_List[Sens-1])

        #    Timer que atualiza a leitura do sinal
        self.timerEvent(None)
        self.timer = self.startTimer(250)

        # Inicializacao do grafico
        # Self.Subplot é da class "Axes" do matplotlib
        self.Subplot = self.mpl.canvas.fig.add_subplot(111)
        # Subplot = self.mpl.canvas.subplot
        self.Subplot.set_xlabel("Wavelength (nm)")
        self.Subplot.set_ylabel("Voltage (V)")
        self.Subplot.set_xlim(400, 700)
        self.Subplot.set_ylim(0, 5)
        # Sets the graph windows as tight
        self.mpl.canvas.fig.tight_layout()
        self.graph, = self.Subplot.plot([], [])

        #    Acerta o limite da ProgressBar
        self.progressBar.setValue(0)
        self.progressBar.setMaximum(1)

        #    Zera o filtro para não dar problema na filtercheck
        self.Filtro_txt.setText('0')

###########
# Funções #
###########

    def Status_byte_e_erro(self):
        MONO.sendCommand("STB?")
        time.sleep(wait_time_monocromador)
        stb = int(float(self.Resposta_MONO()))
        print("status byte (0 - ok; 20 - erro): ", stb)
        if stb != 0:
            MONO.sendCommand("ERROR?")
            time.sleep(wait_time_monocromador)
            error = int(float(self.Resposta_MONO()))
            print("Error number (veja manual!): ", error)


    def Resposta_MONO(self):
        return  MONO.getResponse().split('\r\n')[0]

    # def is_moving(self):


    #    Funcao corrige a ocorrencia de overload
    def OverloadCorrect(self):
        #    Evita que o lockin aumente a escala mais do que o necessario
        if (self.Overload_checkBox.isChecked()):                # Se estiver desabilitado
            return
        statusbyte = int(SRS530.query("Y"))                        # Le o statusbyte
        self.Overload_txt.setEnabled(False)
        self.Overload_txt.setStyleSheet("background-color:")
        app.processEvents()
        while (statusbyte&16 != 0):                                # Se Bit 4 (2^4=16) do statusbyte eh 1, estah em overload
            SRS530.write("K 27")                                # Sensitivity up key
            self.Overload_txt.setEnabled(True)
            self.Overload_txt.setStyleSheet("background-color: rgb(255, 0, 0)")
            app.processEvents()                                    # Atualiza a janela
            time.sleep(WaitTime)                                 # Espera o valor estabilizar
            statusbyte = int(SRS530.query("Y"))                    # Le o statusbyte para limpar
            statusbyte = int(SRS530.query("Y"))
            Sens = int(SRS530.query("G"))
            self.Sens_txt.setText(Sens_List[Sens-1])
            app.processEvents()                                    # Atualiza a janela
        self.Overload_txt.setEnabled(False)
        self.Overload_txt.setStyleSheet("background-color:")
        app.processEvents()

    #    Funcao corrige a ocorrencia de underload (escala alta demais para a medida)
    def UnderloadCorrect(self):
    #    Faz o lockin reduzir a escala quando necessário e não se tem overload
        if (self.Underload_checkBox.isChecked()):                # Se estiver desabilitado
            return
        Sinal = float(SRS530.query("Q1"))                                            # Pega o valor lido
        SensIndex = int(SRS530.query("G")) - 1                                    # Pega o índice da sensibilidade
        SensVal = float(Sens_Val[SensIndex])                                    # Pega o valor da sensibilidade
        statusbyte = int(SRS530.query("Y"))                                         # Le o statusbyte
        self.Underload_txt.setEnabled(False)                                    # Limpa a cor do mostrador de Underload
        self.Underload_txt.setStyleSheet("background-color:")
        app.processEvents()
        while ((Sinal < (SensVal/10)) & (SensIndex != 0) & (statusbyte&16 == 0)):# Caso o valor medido caia a 25% da sensibilidade, não esteja na mínima e não esteja em overload
            self.Underload_txt.setEnabled(True)
            self.Underload_txt.setStyleSheet("background-color: rgb(80, 140, 255)")# Pinta o mostrador de Underload
            SRS530.write("K 28")                                                # sensitivity down key
            app.processEvents()
            time.sleep(WaitTime)                                                  # espera o valor estabilizar
            Sinal = float(SRS530.query("Q1"))                                        # Pega o valor lido
            SensIndex = int(SRS530.query("G")) - 1
            SensVal = float(Sens_Val[SensIndex])                                # Pega a sensibilidade
            self.Sens_txt.setText(Sens_List[SensIndex])
            app.processEvents()
            statusbyte = int(SRS530.query("Y"))                                    # Le o statusbyte para limpar
            statusbyte = int(SRS530.query("Y"))
        self.Underload_txt.setEnabled(False)                                    # Limpa a cor do mostrador de Underload
        self.Underload_txt.setStyleSheet("background-color:")
        self.OverloadCorrect()
        app.processEvents()

    #    Funcao checa a ocorrencia de Unlock ou NoReference
    def UnlockCheck(self):
        statusbyte = int(SRS530.query("Y"))      #Le o statusbyte
        self.Unlocked_txt.setEnabled(False)
        self.Unlocked_txt.setStyleSheet("background-color:")
        self.NoReference_txt.setEnabled(False)
        self.NoReference_txt.setStyleSheet("background-color:")
        app.processEvents() #atualiza a janela
        while (statusbyte&8 != 0) or (statusbyte&4 != 0):
            if(statusbyte&8 != 0):              #Se Bit 3 (2^3=8) do statusbyte True, Unlock
                self.Unlocked_txt.setEnabled(True)
                self.Unlocked_txt.setStyleSheet("background-color: rgb(255, 0, 0)")
            if(statusbyte&4 != 0):              #Se Bit 2 (2^2=4) do statusbyte True, No Reference
                self.NoReference_txt.setEnabled(True)
                self.NoReference_txt.setStyleSheet("background-color: rgb(255, 0, 0)")
            time.sleep(2)
            statusbyte = int(SRS530.query("Y")) #Le o statusbyte para limpar
            app.processEvents() #atualiza a janela
        self.Unlocked_txt.setEnabled(False)
        self.Unlocked_txt.setStyleSheet("background-color:")
        self.NoReference_txt.setEnabled(False)
        self.NoReference_txt.setStyleSheet("background-color:")
        app.processEvents() #atualiza a janela

    #    Funcao que verifica se o filtro utilizado é adequado para o comprimento de onda da medida
    def FilterCheck(self):
        global Filtro
        global Medindo
        if (self.Filtro_checkBox.isChecked()):                # Se estiver desabilitado
            return
        FiltroL = int(self.Filtro_txt.text())

        MONO.sendCommand("WAVE?")
        time.sleep(wait_time_monocromador)
        posicao = float(self.Resposta_MONO())

        if(posicao*1.02 > (FiltroL*2)):
            Filtro = 1
            Medindo = 0
            FilterWinTitle = "Troque o filtro"
            FilterWinText = ("Utilize um filtro com comprimento de onda maior que o original. Insira o valor do comprimento de onda no campo e pressione \"Continuar\" ")
            QMessageBox.critical(None , FilterWinTitle, FilterWinText)
        while(Filtro == 1):
            self.StatusButtonColor()
        #atualiza a janela
        app.processEvents()

    def PauseCheck(self):
        global Pausa
        while (Pausa == 1):
            app.processEvents()

    #    Funcao tempos calcula e atualiza os tempos de integracao e a constante de espera
    def Tempos(self):
        global WaitTimePre
        global WaitTimePost
        global WaitTime
        global InterMeasureTime
        global Dados

        #    Obtem os valores
        Pre = int(SRS530.query("T 1"))
        Post = int(SRS530.query("T 2"))

        #    Calcula os valores
        WaitTimePre = Pre_Time[Pre-1]
        WaitTimePost = Post_Time[Post]
        WaitTime = (3*(WaitTimePre+WaitTimePost))
        InterMeasureTime = WaitTime/10

        #    Atualiza todos os valores na tela
        self.TimePre_txt.setText(str(Pre_Time[Pre-1]) + " s")
        self.TimePost_txt.setText(str(Post_Time[Post]) + " s")
        self.WaitTime_txt.setText('{:.2f}'.format(WaitTime) + " s")
        self.InterMeasureTime_txt.setText('{:.2f}'.format(InterMeasureTime)
                                              + " s")


        #    Atualiza o valor exibido da grade na interface

    def AtualizaGrade(self):
        movendo = True
        while movendo:
            MONO.sendCommand("STB?")
            time.sleep(wait_time_monocromador)
            resposta = str(self.Resposta_MONO())
            if resposta == "00":
                movendo = False

        MONO.sendCommand("GRAT?")
        time.sleep(wait_time_monocromador)
        gradeAtual = str(self.Resposta_MONO())
        num_grade = gradeAtual.split(',')[0]
        self.GradeAtual_txt.setText(num_grade)
        app.processEvents()

        #    Atualiza o valor exibido da posicao(comp. de onda) na interface

    def AtualizaPosicao(self):
        movendo = True
        while movendo:
            MONO.sendCommand("STB?")
            time.sleep(wait_time_monocromador)
            resposta = str(self.Resposta_MONO())
            if resposta == "00":
                movendo = False

        MONO.sendCommand("WAVE?")
        time.sleep(wait_time_monocromador)
        PosicaoAtual = str(self.Resposta_MONO())
        self.Posicao_LCD.display(str(PosicaoAtual))
        app.processEvents()

    def AtualizaSinal(self):
        self.Sinal_LCD.display(str(SRS530.query("Q1")))
        app.processEvents()

    def StatusButtonColor(self):
        if(Parar == 1):
            self.Status_txt.setStyleSheet("background-color: rgb(255, 70, 70)") # Vermelho
            self.Status_txt.setText("Parado")
        if(Medindo == 1):
            self.Status_txt.setStyleSheet("background-color: rgb(255, 255, 100)") # Amarelo
            self.Status_txt.setText("Medida")
        if(Filtro == 1):
            self.Status_txt.setStyleSheet("background-color: rgb(80, 140, 255)") # Azul
            self.Status_txt.setText("Troque o filtro")
        if(Fim == 1):
            self.Status_txt.setStyleSheet("background-color: rgb(100, 255, 100)") # Verde
            self.Status_txt.setText("Aguardando")
        if(Pausa == 1):
            self.Status_txt.setStyleSheet("background-color: rgb(80, 255, 255)") # Azul claro
            self.Status_txt.setText("Em pausa")
        self.ButtonsActive()
        app.processEvents()

    def ButtonsActive(self):
        if(Parar == 1):
            self.Continuar_btn.setEnabled(False)
            self.Suspender_btn.setEnabled(False)
            self.Parar_btn.setEnabled(False)
            self.Medir_btn.setEnabled(True)
            self.Salvar_btn.setEnabled(True)
            self.EstimarTempo_btn.setEnabled(True)
        if(Medindo == 1):
            self.Continuar_btn.setEnabled(False)
            self.Suspender_btn.setEnabled(True)
            self.Parar_btn.setEnabled(True)
            self.Medir_btn.setEnabled(False)
            self.Salvar_btn.setEnabled(False)
            self.EstimarTempo_btn.setEnabled(False)
        if(Filtro == 1):
            self.Continuar_btn.setEnabled(True)
            self.Suspender_btn.setEnabled(False)
            self.Parar_btn.setEnabled(False)
            self.Medir_btn.setEnabled(False)
            self.Salvar_btn.setEnabled(False)
            self.EstimarTempo_btn.setEnabled(False)
        if(Fim == 1):
            self.Continuar_btn.setEnabled(False)
            self.Suspender_btn.setEnabled(False)
            self.Parar_btn.setEnabled(False)
            self.Medir_btn.setEnabled(True)
            self.Salvar_btn.setEnabled(True)
            self.EstimarTempo_btn.setEnabled(True)
        if(Pausa == 1):
            self.Continuar_btn.setEnabled(True)
            self.Suspender_btn.setEnabled(False)
            self.Parar_btn.setEnabled(False)
            self.Medir_btn.setEnabled(False)
            self.Salvar_btn.setEnabled(True)
            self.EstimarTempo_btn.setEnabled(False)
        if(self.Filtro_checkBox.isChecked()):                # Se estiver desabilitado
            self.Filtro_txt.setEnabled(False)
        else:
            self.Filtro_txt.setEnabled(True)
        app.processEvents()

        #    Atualiza o valor do sinal adquirido do Lock-In

    def timerEvent(self, evt):
        if(Medindo == 0):
            self.AtualizaSinal()
        self.StatusButtonColor()


        #    Escreve o cabeçalho da medida

    def PegaDadosMedida(self):
        global Dados
        Pre = int(SRS530.query("T 1"))
        Post = int(SRS530.query("T 2"))
        Dados = 'Comprimento_de_Onda Media Desvio_Padrao | '
        Dados = Dados + 'Inicio: ' + str(int(self.Inicio_txt.text())) + 'nm  | '                             #Comprimento de onda do inicio da medida
        Dados = Dados + 'Fim: ' + str(int(self.Fim_txt.text())) + 'nm | '                            #Fim da medida
        Dados = Dados + 'Passo: ' + str(int(self.Step_txt.text())) + 'nm | '                      #Passo da medida
        Dados = Dados + 'Medidas por passo: ' + str(int(self.NumMedidas_txt.text())) + ' | '            #Medidas por passo
        Dados = Dados + 'Tempo Pre: ' + str(Pre_Time[Pre-1]) + "s | "                              #Tempo Pre do Lock-In
        Dados = Dados + 'Tempo Post: ' + str(Post_Time[Post]) + "s | "                               #Tempo Pos do Lock-In
        Dados = Dados + 'Data: ' + time.asctime( time.localtime(time.time()))                    #Tempo e Data atuais


##########
# Botoes #
##########

    #    Seleciona a grade de difracao
    def MUDAGRADE(self):
        try:
            grade = self.Grade_txt.text()
        except:
            return    
        comando = "GRAT " + str(grade)
        MONO.sendCommand(comando)
        time.sleep(wait_time_monocromador)
        self.AtualizaGrade()
        self.AtualizaPosicao()

    #    Seleciona a posicao da grade em comprimento de onda, nanometros
    def GOTO(self):
        try:
            Posicao = float(self.Posicao_txt.text())
        except:
            return    
        comando = "GOWAVE " + str(Posicao)
        MONO.sendCommand(comando)
        time.sleep(wait_time_monocromador)
        self.AtualizaPosicao()

    def EstimarTempo(self):
        inicio = int(self.Inicio_txt.text())
        step = int(self.Step_txt.text())
        fim = int(self.Fim_txt.text())
        passos = range(inicio, (fim+step) ,step)
        self.NumPassos_txt.setText(str(len(passos)))
        medidas = int(self.NumMedidas_txt.text())
        self.Tempos()
        numpassos=len(passos)
        tempoest = 2.8*( (numpassos * medidas * InterMeasureTime) + 1.1*((numpassos * WaitTime)) + 0.004*(step*numpassos)) #Fator de correcao experimental, ver de onde ele sai
        if(tempoest > 60):
            tempoest = tempoest/60
            tempoest = str(int(round(tempoest,0))) + " m"
        else:
            tempoest = str(round(tempoest,1)) + " s"
        self.TempoEst_txt.setText(tempoest)
        self.TempoTot_txt.setText("0 s")
        app.processEvents() #atualiza a janela

    #    funcoes que trocam o tempo de integracao do lockin
    def PreMais(self):
        SRS530.write("K 3")
        Pre = int(SRS530.query("T 1"))
        self.TimePre_txt.setText(str(Pre_Time[Pre-1]) + " s")
        self.Tempos()

    def PreMenos(self):
        SRS530.write("K 4")
        Pre = int(SRS530.query("T 1"))
        self.TimePre_txt.setText(str(Pre_Time[Pre-1]) + " s")
        self.Tempos()

    def PuloMais(self):
        try:
            Pulo = float(self.PosicaoStep_txt.text())
            MONO.sendCommand("WAVE?")
            time.sleep(wait_time_monocromador)
            PosicaoAtual = float(self.Resposta_MONO())
            comando = "GOWAVE " + str(PosicaoAtual + Pulo)
            MONO.sendCommand(comando)
            time.sleep(wait_time_monocromador)
        except:
            return
        self.AtualizaPosicao()

    def PuloMenos(self):
        try:
            Pulo = float(self.PosicaoStep_txt.text())
            MONO.sendCommand("WAVE?")
            time.sleep(wait_time_monocromador)
            PosicaoAtual = float(self.Resposta_MONO())
            comando = "GOWAVE " + str(PosicaoAtual - Pulo)
            MONO.sendCommand(comando)
            time.sleep(wait_time_monocromador)
        except:
            return
        self.AtualizaPosicao()

    def PostMais(self):
        SRS530.write("K 1")
        Post = int(SRS530.query("T 2"))
        self.TimePost_txt.setText(str(Post_Time[Post]) + " s")
        self.Tempos()

    def PostMenos(self):
        SRS530.write("K 2")
        Post = int(SRS530.query("T 2"))
        self.TimePost_txt.setText(str(Post_Time[Post]) + " s")
        self.Tempos()

    #    funcoes que ajustam a sensibilidade do lockin
    def SensMais(self):
        SRS530.write("K 27")
        Sens = int(SRS530.query("G"))
        self.Sens_txt.setText(Sens_List[Sens-1])

    def SensMenos(self):
        SRS530.write("K 28")
        Sens = int(SRS530.query("G"))
        self.Sens_txt.setText(Sens_List[Sens-1])

    def PararMedida(self):
        global Parar
        Parar = 1
        self.StatusButtonColor()
        app.processEvents()

    #    Continua a medida após a troca do filtro
    def ContinuarMedida(self):
        global Pausa
        global Filtro
        global Medindo
        Filtro = 0
        Pausa = 0
        Medindo = 1
        self.StatusButtonColor()


    def SalvarMedida(self):
        global PosicaoReal
        global MedidaMean
        global MedidaStd
        global Dados
        try:
            file = QFileDialog.getSaveFileName(self, "Salvar dados em arquivo", self.tr("*.dat"),options=QFileDialog.DontUseNativeDialog)
            saida = np.column_stack((PosicaoReal,MedidaMean,MedidaStd))
            np.savetxt(str(file[0]), saida, header=Dados, comments='')
        except:
            print("Cancelou salvamento do arquivo")

    def SuspenderMedida(self):
        global Pausa
        Pausa = 1
        self.StatusButtonColor()
        app.processEvents()


    #    Função principal de medição
    def MEDIR(self):
        global Medindo
        global Parar
        global Pausa
        global Fim
        global PosicaoReal
        global MedidaMean
        global MedidaStd
        global Dados
        Medindo = 1
        Parar = 0
        Pausa = 0
        Fim = 0

        # Acerta a cor do botão
        self.StatusButtonColor()

        # Adquire os limites de medicao, o passo, o numero de medidas por passo e o primeiro filtro utilizado
        inicio = int(self.Inicio_txt.text())
        step = int(self.Step_txt.text())
        fim = int(self.Fim_txt.text())
        Medidas = int(self.NumMedidas_txt.text())

        # inicializa a escala do gráfico
        MargemX = 0.05
        DeltaX = fim-inicio
        self.Subplot.set_xlim(inicio-(DeltaX*MargemX), (fim)+(DeltaX*MargemX))

        #    Define e atualiza o numero de passos
        self.EstimarTempo()
        Passos = range(inicio, (fim+step) ,step)
        self.NumPassos_txt.setText(str(len(Passos)))

        #  Acerta o limite e o zera a ProgressBar
        self.progressBar.setMaximum(len(Passos))
        self.progressBar.setValue(0)

        # Inicializacao das listas
        PosicaoReal = []  # Posicao real do monocromador a cada medida
        MedidaMean = []  # Media
        MedidaStd = []  # Desvio padrao

        # Define o tempo entre medidas consecutivas
        self.Tempos()

        # Le e limpa o byte de status
        statusbyte = int(SRS530.query("Y"))

        # Inicia o contador do tempo de medicao
        CronoInicio = time.time()

        # Inicializa o gráfico
        self.Subplot.autoscale(True, 'y')
        DadosPlot, = self.Subplot.plot(PosicaoReal, MedidaMean)

        ########
        #Medida#
        ########
        for passo in Passos:
            comando = "GOWAVE " + str(passo)
            MONO.sendCommand(comando)
            time.sleep(wait_time_monocromador)

            # MONO.query(comando)  # usando o ask e handshake para continuar so apos o termino do comando
            self.AtualizaPosicao()
            self.AtualizaSinal()
            time.sleep(WaitTime)  # esperando 3 vezes a soma do tempo de integracao

            statusbyte = int(SRS530.query("Y"))

            # Checa se o botao Pausa foi pressionado
            self.PauseCheck()
            # Checa se ha overload e atualiza o texto e a tela caso haja
            self.OverloadCorrect()
            self.UnderloadCorrect()
            # Checa a referencia de frequencia
            self.UnlockCheck()
            # Checa se o filtro utilizado e apropriado para a medida
            self.FilterCheck()

            Medida = []                               #lista que armazena todas as medidas para um comprimento de onda

            for i in range(1,1+Medidas):
                if (Parar == 1):
                    Medindo = 0
                    return
                self.PauseCheck()
                Medida = Medida + [float(SRS530.query("Q1"))]
                time.sleep(InterMeasureTime)

            # le a posicao atual real
            MONO.sendCommand("WAVE?")
            time.sleep(wait_time_monocromador)
            PosicaoReal = PosicaoReal + [float(self.Resposta_MONO())]

            MedidaMean = MedidaMean + [float(np.mean(Medida))]
            MedidaStd = MedidaStd + [float(np.std(Medida))]

            # update lines data using the lists with new data
            # self.graph.set_marker('.')
            # self.graph.set_markersize(10)
            # self.graph.set_data(PosicaoReal, MedidaMean)
            DadosPlot.set_data(PosicaoReal, MedidaMean)
            self.Subplot.relim()
            self.Subplot.autoscale_view(True,False,True) #only scales Y
            # Changes layout to tight
            self.mpl.canvas.fig.tight_layout()

            # # Adjusts the window limits
            # if(passo != Passos[0]):
            #     if(min(MedidaMean) > 0):
            #         DeltaY = max(MedidaMean) - min(MedidaMean)
            #     else:
            #         DeltaY = max(MedidaMean) + min(MedidaMean)
            #     MargemY = 0.05
            #     self.Subplot.set_ylim(min(MedidaMean) - MargemY * DeltaY,
            #                           MargemY * DeltaY + max(MedidaMean))
            # else:
            #     self.Subplot.set_ylim(min(MedidaMean) * 0.95,
            #                           min(MedidaMean) * 1.05)


            # force a redraw of the Figure
            self.mpl.canvas.draw()

            #    Acerta a ProgressBar
            self.progressBar.setValue(len(PosicaoReal))

        #    Calcula o tempo que levou pra medir
        CronoFim = time.time()

        if(CronoFim - CronoInicio < 60):
            self.TempoTot_txt.setText(str(round((CronoFim - CronoInicio),1)) + " s")
        else:
            self.TempoTot_txt.setText(str(int(round((CronoFim - CronoInicio)/60,0))) + " m")

        Medindo = 0
        Fim = 1
        print("vai entrar no pega dados")
        self.PegaDadosMedida()
        print("Saiu do pega dados")
        print("Vai entrar no salvar medida")
        self.SalvarMedida()
        print("saiu do salvar medida")

    def closeEvent(self, event):
        reply = QMessageBox.question(self, 'Window Close', 'Are you sure you want to close the window?',
                QMessageBox.Yes | QMessageBox.No, QMessageBox.No)

        if reply == QMessageBox.Yes:
            NoConnWinTitle = "Desligar os equipamentos!"
            NoConnWinText = "Desligue o monocromador e o lock-in!"
            QMessageBox.critical(None , NoConnWinTitle, NoConnWinText)
            event.accept()
            print('Window closed')
        else:
            event.ignore()

app = QApplication(sys.argv)

dmw = DesignerMainWindow()
dmw.show()

print(rm.list_resources())


sys.exit(app.exec_())
