```csharp
// Decompiled with JetBrains decompiler
// Type: CornerstoneDll.Cornerstone
// Assembly: Cornerstone, Version=1.0.1.1, Culture=neutral, PublicKeyToken=16985ea2ac4d9458
// MVID: 4552BD8C-3F7A-432D-A048-FA437BBA6D4E
// Assembly location: C:\Users\carlo\OneDrive\Documentos\Programming\electronjs\LabHub\labhub_app\labhub_server\Cornerstone.dll

using CyUSB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

#nullable disable
namespace CornerstoneDll
{
  public class Cornerstone
  {
    public USBDeviceList usbDevices;
    public CyUSBDevice device;
    private CyUSBDevice[] connectedDevices = new CyUSBDevice[10];
    private static int XFERSIZE = 64;
    private byte[] outData = new byte[Cornerstone.XFERSIZE];
    private byte[] inData = new byte[Cornerstone.XFERSIZE];
    private int waitTime = 10;
    private uint dev_timeout = 500;
    private CyBulkEndPoint BulkInEndPt;
    private CyBulkEndPoint BulkOutEndPt;
    private int vendorId = 4480;
    private int productId = 18;
    private string lastMessage;

    public Cornerstone(bool connect)
    {
      if (!connect)
        return;
      this.connect();
    }

    ~Cornerstone() => this.disconnect();

    public bool findDevices()
    {
      this.usbDevices = new USBDeviceList((byte) 1);
      this.usbDevices = this.listDevices();
      this.device = this.usbDevices[this.vendorId, this.productId] as CyUSBDevice;
      return true;
    }

    public bool connect()
    {
      this.findDevices();
      if (this.device != null)
      {
        this.BulkInEndPt = this.device.EndPointOf((byte) 129) as CyBulkEndPoint;
        this.BulkOutEndPt = this.device.EndPointOf((byte) 1) as CyBulkEndPoint;
        this.lastMessage = this.getDeviceName() + " connected.";
        return true;
      }
      this.lastMessage = "Please Connect Cornerstone Device";
      return false;
    }

    public void disconnect()
    {
      this.lastMessage = "Device disconnected.";
      this.device = (CyUSBDevice) null;
    }

    public void PnP_Event_Handler(IntPtr pnpEvent, IntPtr hRemovedDevice)
    {
      if (pnpEvent.Equals((object) CyConst.DBT_DEVICEREMOVECOMPLETE))
      {
        this.usbDevices.Remove(hRemovedDevice);
        this.disconnect();
      }
      if (!pnpEvent.Equals((object) CyConst.DBT_DEVICEARRIVAL))
        return;
      this.usbDevices.Add();
      this.connect();
    }

    public void setVendorID(int id) => this.vendorId = id;

    public int getVendorID() => this.vendorId;

    public void setProductID(int id) => this.productId = id;

    public int getProductID() => this.productId;

    public bool sendCommand(string command)
    {
      this.outData = Cornerstone.StringToByteArray(command + Environment.NewLine);
      this.BulkOutEndPt.TimeOut = this.dev_timeout;
      bool flag = this.BulkOutEndPt.XferData(ref this.outData, ref Cornerstone.XFERSIZE);
      this.lastMessage = "Data Sent: " + Cornerstone.HexStr(this.outData);
      return flag;
    }

    public string getResponse()
    {
      this.BulkInEndPt.TimeOut = this.dev_timeout;
      this.BulkInEndPt.XferData(ref this.inData, ref Cornerstone.XFERSIZE);
      int num = 0;
      while ((long) (num * this.waitTime) < (long) this.dev_timeout)
      {
        ++num;
        this.lastMessage = "Loop Count = " + num.ToString();
        Thread.Sleep(this.waitTime);
        if (this.inData != null)
          break;
      }
      return this.ByteArrayToString(this.inData) + " - Loops = " + num.ToString();
    }

    public USBDeviceList listDevices() => this.usbDevices;

    public string getDeviceName() => this.device.FriendlyName;

    private void setLastMessage(string msg) => this.lastMessage = msg;

    public string getLastMessage() => this.lastMessage;

    public double getBandpass() => this.getDoubleResponseFromCommand("BANDPASS?");

    public void setBandpass(double bandpass) => this.sendCommand("BANDPASS" + bandpass.ToString());

    public int getFilter() => this.getIntResponseFromCommand("FILTER?");

    public void setFilterLabel(int filter_position, string label)
    {
      this.sendCommand("FILTER" + filter_position.ToString() + "LABEL " + label);
    }

    public string getFilterLabel(int filter_position)
    {
      return this.getStringResponseFromCommand("FILTER" + filter_position.ToString() + "LABEL?");
    }

    public void setFilter(int filter) => this.sendCommand("FILTER " + filter.ToString());

    public double getWavelength() => this.getDoubleResponseFromCommand("WAVE?");

    public bool setWavelength(double wavelength)
    {
      this.setLastMessage("Going to " + wavelength.ToString());
      this.handshake(true);
      this.getResponse();
      this.sendCommand("GOWAVE " + wavelength.ToString());
      for (int index = 0; !this.getResponse().StartsWith("0") && index < 120000 / this.waitTime; ++index)
        Thread.Sleep(this.waitTime);
      this.handshake(false);
      this.getResponse();
      Thread.Sleep(this.waitTime);
      return true;
    }

    public bool getShutter()
    {
      string responseFromCommand = this.getStringResponseFromCommand("SHUTTER?");
      this.setLastMessage(responseFromCommand);
      return !(responseFromCommand.Substring(0, 1) == "C");
    }

    public void setShutter(bool status)
    {
      char ch = !status ? 'C' : 'O';
      this.sendCommand("SHUTTER " + (object) ch);
      this.setLastMessage("SHUTTER " + (object) ch);
    }

    public string getUnits()
    {
      return ((IEnumerable<string>) this.getStringResponseFromCommand("UNITS?").Split('\n')).FirstOrDefault<string>();
    }

    public void setUnits(WAVELENGTH_UNITS unit)
    {
      this.sendCommand("UNITS " + (object) unit);
      this.setLastMessage("UNITS " + (object) unit);
    }

    public int getSlitWidth(CS_PORT port)
    {
      return this.getIntResponseFromCommand("SLIT" + this.getSlitMicrons(port).ToString() + "MICRONS?");
    }

    public void setSlitWidth(CS_PORT port, int width)
    {
      this.sendCommand("SLIT" + this.getSlitMicrons(port).ToString() + "MICRONS" + (object) width);
    }

    private int getSlitMicrons(CS_PORT port)
    {
      int slitMicrons = -1;
      switch (port)
      {
        case CS_PORT.ONAXISC:
          slitMicrons = 3;
          break;
        case CS_PORT.OFFAXISB:
          slitMicrons = 2;
          break;
        case CS_PORT.INPORTA:
          slitMicrons = 1;
          break;
      }
      return slitMicrons;
    }

    public double getGratZero(int grating)
    {
      return this.getDoubleResponseFromCommand("GRAT" + grating.ToString() + "ZERO?");
    }

    public void setGratingZero(int grating, double zero)
    {
      this.sendCommand("GRAT" + grating.ToString() + "ZERO " + zero.ToString());
    }

    public string getGrating() => this.getStringResponseFromCommand("GRAT?");

    public string getGratingLabel(int grating)
    {
      return ((IEnumerable<string>) this.getStringResponseFromCommand("GRAT" + grating.ToString() + "LABEL?").Split('\n')).FirstOrDefault<string>();
    }

    public void setGratingLabel(int grating, string label)
    {
      this.sendCommand("GRAT" + grating.ToString() + "LABEL " + label);
    }

    public double getGratingOffset(int grating)
    {
      return this.getDoubleResponseFromCommand("GRAT" + grating.ToString() + "OFFSET?");
    }

    public void setGratingOffset(int grating, double offset)
    {
      this.sendCommand("GRAT" + grating.ToString() + "OFFSET " + offset.ToString());
    }

    public int getGratingLines(int grating)
    {
      return this.getIntResponseFromCommand("GRAT" + grating.ToString() + "LINES?");
    }

    public void setGratingLines(int grating, int lines)
    {
      this.sendCommand("GRAT" + grating.ToString() + "LINES " + lines.ToString());
    }

    public bool setGrating(int grating)
    {
      this.handshake(true);
      this.getResponse();
      this.sendCommand("GRAT " + (object) grating);
      for (int index = 0; !this.getResponse().StartsWith("0") && index < 120000 / this.waitTime; ++index)
        Thread.Sleep(this.waitTime);
      this.getResponse();
      this.handshake(false);
      this.getResponse();
      Thread.Sleep(this.waitTime);
      return true;
    }

    public double getFactor(int grating)
    {
      return this.getDoubleResponseFromCommand("GRAT" + grating.ToString() + "FACTOR?");
    }

    public void setFactor(int grating, double factor)
    {
      this.sendCommand("GRAT" + (object) grating + "FACTOR " + (object) factor);
    }

    public void handshake(bool on)
    {
      this.sendCommand("HANDSHAKE " + (!on ? "0" : "1"));
      Thread.Sleep(this.waitTime);
      this.getResponse();
    }

    public void setStep(int step) => this.getIntResponseFromCommand("STEP" + step.ToString());

    public int getIntResponseFromCommand(string command)
    {
      int result = -1;
      if (!int.TryParse(((IEnumerable<string>) this.getResponseFromCommand(command).Split('\n')).FirstOrDefault<string>(), out result))
        result = -1;
      return result;
    }

    public double getDoubleResponseFromCommand(string command)
    {
      double result;
      if (!double.TryParse(((IEnumerable<string>) this.getResponseFromCommand(command).Split('\n')).FirstOrDefault<string>(), out result))
        result = -1.0;
      return result;
    }

    public string getStringResponseFromCommand(string command)
    {
      return this.getResponseFromCommand(command).Trim();
    }

    private string getResponseFromCommand(string command)
    {
      this.sendCommand(command);
      this.setLastMessage(command);
      string msg = "";
      for (int index = 0; msg.Equals("") || index < 5; ++index)
        msg = this.getResponse();
      this.setLastMessage(msg);
      return msg;
    }

    public void setWaitTime(int wait) => this.waitTime = wait;

    public int getWaitTime() => this.waitTime;

    public uint getDeviceTimeout() => this.dev_timeout;

    public void setDeviceTimeout(uint dev_timeout)
    {
    }

    private static string HexStr(byte[] p)
    {
      char[] chArray = new char[p.Length * 2 + 2];
      chArray[0] = '0';
      chArray[1] = 'x';
      int index1 = 0;
      int index2 = 2;
      while (index1 < p.Length)
      {
        byte num1 = (byte) ((uint) p[index1] >> 4);
        chArray[index2] = num1 > (byte) 9 ? (char) ((int) num1 + 55) : (char) ((int) num1 + 48);
        byte num2 = (byte) ((uint) p[index1] & 15U);
        int num3;
        chArray[num3 = index2 + 1] = num2 > (byte) 9 ? (char) ((int) num2 + 55) : (char) ((int) num2 + 48);
        ++index1;
        index2 = num3 + 1;
      }
      return new string(chArray);
    }

    private static byte[] StringToByteArray(string str) => new UTF8Encoding().GetBytes(str);

    private string ByteArrayToString(byte[] input) => new UTF8Encoding().GetString(input);
  }
}

```