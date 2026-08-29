$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;

public static class IconGenerator
{
    public static void Generate(string path, int size, string type)
    {
        using (Bitmap bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb))
        using (Graphics g = Graphics.FromImage(bmp))
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;

            Color cTop = Color.FromArgb(255, 160, 82, 45);    // #A0522D
            Color cBottom = Color.FromArgb(255, 92, 44, 22);  // #5C2C16
            Color cGold = Color.FromArgb(255, 230, 186, 100); // #E6BA64
            Color cWhite = Color.FromArgb(255, 250, 247, 242); // #FAF7F2
            Color cShadow = Color.FromArgb(90, 0, 0, 0);

            Rectangle fullRect = new Rectangle(0, 0, size, size);

            if (type == "foreground")
            {
                g.Clear(Color.Transparent);

                int crestSize = (int)(size * 0.65f);
                int offsetX = (size - crestSize) / 2;
                int offsetY = (size - crestSize) / 2;

                Rectangle crestRect = new Rectangle(offsetX, offsetY, crestSize, crestSize);
                using (LinearGradientBrush brush = new LinearGradientBrush(crestRect, cTop, cBottom, LinearGradientMode.Vertical))
                using (GraphicsPath pathShape = CreateRoundedRectanglePath(crestRect, (int)(crestSize * 0.26f)))
                {
                    g.FillPath(brush, pathShape);

                    using (Pen goldPen = new Pen(cGold, Math.Max(1.5f, crestSize * 0.025f)))
                    {
                        Rectangle innerRect = new Rectangle(offsetX + 4, offsetY + 4, crestSize - 8, crestSize - 8);
                        using (GraphicsPath innerPath = CreateRoundedRectanglePath(innerRect, (int)(crestSize * 0.22f)))
                        {
                            g.DrawPath(goldPen, innerPath);
                        }
                    }
                }

                // Star Sparkle
                DrawStar(g, size / 2, offsetY + (int)(crestSize * 0.16f), (int)(crestSize * 0.07f), cGold);

                // Letter I
                float fontSize = crestSize * 0.50f;
                using (Font font = new Font("Georgia", fontSize, FontStyle.Bold | FontStyle.Italic, GraphicsUnit.Pixel))
                using (StringFormat sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
                using (SolidBrush shadowBrush = new SolidBrush(cShadow))
                using (SolidBrush textBrush = new SolidBrush(cWhite))
                {
                    RectangleF shadowRect = new RectangleF(offsetX + 2, offsetY + (crestSize * 0.08f) + 2, crestSize, crestSize);
                    RectangleF textRect = new RectangleF(offsetX, offsetY + (crestSize * 0.08f), crestSize, crestSize);
                    g.DrawString("I", font, shadowBrush, shadowRect, sf);
                    g.DrawString("I", font, textBrush, textRect, sf);
                }
            }
            else if (type == "round")
            {
                g.Clear(Color.Transparent);

                using (LinearGradientBrush brush = new LinearGradientBrush(fullRect, cTop, cBottom, LinearGradientMode.Vertical))
                {
                    g.FillEllipse(brush, 2, 2, size - 4, size - 4);
                }

                using (Pen goldPen = new Pen(cGold, Math.Max(1.5f, size * 0.03f)))
                {
                    g.DrawEllipse(goldPen, 4, 4, size - 8, size - 8);
                }

                DrawStar(g, size / 2, (int)(size * 0.18f), (int)(size * 0.07f), cGold);

                float fontSize = size * 0.48f;
                using (Font font = new Font("Georgia", fontSize, FontStyle.Bold | FontStyle.Italic, GraphicsUnit.Pixel))
                using (StringFormat sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
                using (SolidBrush shadowBrush = new SolidBrush(cShadow))
                using (SolidBrush textBrush = new SolidBrush(cWhite))
                {
                    RectangleF shadowRect = new RectangleF(2, (size * 0.08f) + 2, size, size);
                    RectangleF textRect = new RectangleF(0, size * 0.08f, size, size);
                    g.DrawString("I", font, shadowBrush, shadowRect, sf);
                    g.DrawString("I", font, textBrush, textRect, sf);
                }
            }
            else // square / squircle
            {
                g.Clear(Color.Transparent);

                using (LinearGradientBrush brush = new LinearGradientBrush(fullRect, cTop, cBottom, LinearGradientMode.Vertical))
                using (GraphicsPath pathShape = CreateRoundedRectanglePath(fullRect, (int)(size * 0.22f)))
                {
                    g.FillPath(brush, pathShape);

                    using (Pen goldPen = new Pen(cGold, Math.Max(1.5f, size * 0.025f)))
                    {
                        Rectangle innerRect = new Rectangle(3, 3, size - 6, size - 6);
                        using (GraphicsPath innerPath = CreateRoundedRectanglePath(innerRect, (int)(size * 0.19f)))
                        {
                            g.DrawPath(goldPen, innerPath);
                        }
                    }
                }

                DrawStar(g, size / 2, (int)(size * 0.17f), (int)(size * 0.07f), cGold);

                float fontSize = size * 0.48f;
                using (Font font = new Font("Georgia", fontSize, FontStyle.Bold | FontStyle.Italic, GraphicsUnit.Pixel))
                using (StringFormat sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
                using (SolidBrush shadowBrush = new SolidBrush(cShadow))
                using (SolidBrush textBrush = new SolidBrush(cWhite))
                {
                    RectangleF shadowRect = new RectangleF(2, (size * 0.08f) + 2, size, size);
                    RectangleF textRect = new RectangleF(0, size * 0.08f, size, size);
                    g.DrawString("I", font, shadowBrush, shadowRect, sf);
                    g.DrawString("I", font, textBrush, textRect, sf);
                }
            }

            bmp.Save(path, ImageFormat.Png);
        }
    }

    private static GraphicsPath CreateRoundedRectanglePath(Rectangle rect, int radius)
    {
        GraphicsPath path = new GraphicsPath();
        int d = radius * 2;
        path.AddArc(rect.X, rect.Y, d, d, 180, 90);
        path.AddArc(rect.Right - d, rect.Y, d, d, 270, 90);
        path.AddArc(rect.Right - d, rect.Bottom - d, d, d, 0, 90);
        path.AddArc(rect.X, rect.Bottom - d, d, d, 90, 90);
        path.CloseFigure();
        return path;
    }

    private static void DrawStar(Graphics g, int cx, int cy, int r, Color color)
    {
        int inner = (int)(r * 0.35f);
        Point[] points = new Point[]
        {
            new Point(cx, cy - r),
            new Point(cx + inner, cy - inner),
            new Point(cx + r, cy),
            new Point(cx + inner, cy + inner),
            new Point(cx, cy + r),
            new Point(cx - inner, cy + inner),
            new Point(cx - r, cy),
            new Point(cx - inner, cy - inner)
        };
        using (SolidBrush brush = new SolidBrush(color))
        {
            g.FillPolygon(brush, points);
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies "System.Drawing"

$densities = @(
    @{ Name = "mipmap-mdpi"; LauncherSize = 48; ForegroundSize = 108 },
    @{ Name = "mipmap-hdpi"; LauncherSize = 72; ForegroundSize = 162 },
    @{ Name = "mipmap-xhdpi"; LauncherSize = 96; ForegroundSize = 216 },
    @{ Name = "mipmap-xxhdpi"; LauncherSize = 144; ForegroundSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; LauncherSize = 192; ForegroundSize = 432 }
)

$baseRes = "android\app\src\main\res"

foreach ($d in $densities) {
    $dir = Join-Path $baseRes $d.Name
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $squarePath = Join-Path $dir "ic_launcher.png"
    $roundPath = Join-Path $dir "ic_launcher_round.png"
    $fgPath = Join-Path $dir "ic_launcher_foreground.png"

    [IconGenerator]::Generate($squarePath, $d.LauncherSize, "square")
    [IconGenerator]::Generate($roundPath, $d.LauncherSize, "round")
    [IconGenerator]::Generate($fgPath, $d.ForegroundSize, "foreground")

    Write-Host "Done: $($d.Name)"
}

Write-Host "All Android mipmap icons generated successfully!"
