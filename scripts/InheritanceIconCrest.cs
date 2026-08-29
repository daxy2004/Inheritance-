using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class InheritanceIconCrest
{
    public static void Generate(string path, int size, string type)
    {
        using (Bitmap bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb))
        using (Graphics g = Graphics.FromImage(bmp))
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;

            Color cDarkBrown = Color.FromArgb(255, 32, 14, 5);     // #200E05
            Color cEspresso  = Color.FromArgb(255, 120, 53, 15);   // #78350F
            Color cGoldLight = Color.FromArgb(255, 251, 227, 161); // #FBE3A1
            Color cGoldMid   = Color.FromArgb(255, 226, 166, 59);  // #E2A63B
            Color cGoldDark  = Color.FromArgb(255, 179, 107, 24);  // #B36B18
            Color cStar      = Color.FromArgb(255, 255, 251, 235); // #FFFBEB

            Rectangle fullRect = new Rectangle(0, 0, size, size);

            if (type == "foreground")
            {
                g.Clear(Color.Transparent);
                int emblemSize = (int)(size * 0.70f);
                int off = (size - emblemSize) / 2;
                Rectangle emblemRect = new Rectangle(off, off, emblemSize, emblemSize);

                using (LinearGradientBrush bgBrush = new LinearGradientBrush(emblemRect, cEspresso, cDarkBrown, LinearGradientMode.Vertical))
                {
                    g.FillEllipse(bgBrush, emblemRect);
                }

                using (Pen borderPen = new Pen(cGoldMid, Math.Max(1.5f, emblemSize * 0.028f)))
                {
                    g.DrawEllipse(borderPen, emblemRect.X + 2, emblemRect.Y + 2, emblemRect.Width - 4, emblemRect.Height - 4);
                }

                DrawTree(g, emblemRect, cGoldLight, cGoldMid, cGoldDark, cStar);
            }
            else if (type == "round")
            {
                g.Clear(Color.Transparent);

                using (LinearGradientBrush bgBrush = new LinearGradientBrush(fullRect, cEspresso, cDarkBrown, LinearGradientMode.Vertical))
                {
                    g.FillEllipse(bgBrush, 1, 1, size - 2, size - 2);
                }

                using (Pen borderPen = new Pen(cGoldMid, Math.Max(2.0f, size * 0.03f)))
                {
                    g.DrawEllipse(borderPen, 3, 3, size - 6, size - 6);
                }

                DrawTree(g, fullRect, cGoldLight, cGoldMid, cGoldDark, cStar);
            }
            else // square
            {
                g.Clear(Color.Transparent);

                int rad = (int)(size * 0.22f);
                using (GraphicsPath pathShape = CreateRoundedRectanglePath(fullRect, rad))
                using (LinearGradientBrush bgBrush = new LinearGradientBrush(fullRect, cEspresso, cDarkBrown, LinearGradientMode.Vertical))
                {
                    g.FillPath(bgBrush, pathShape);

                    using (Pen borderPen = new Pen(cGoldMid, Math.Max(2.0f, size * 0.025f)))
                    {
                        Rectangle inner = new Rectangle(3, 3, size - 6, size - 6);
                        using (GraphicsPath innerPath = CreateRoundedRectanglePath(inner, (int)(rad * 0.85f)))
                        {
                            g.DrawPath(borderPen, innerPath);
                        }
                    }
                }

                DrawTree(g, fullRect, cGoldLight, cGoldMid, cGoldDark, cStar);
            }

            bmp.Save(path, ImageFormat.Png);
        }
    }

    private static void DrawTree(Graphics g, Rectangle bounds, Color cLight, Color cMid, Color cDark, Color cStar)
    {
        float scale = bounds.Width / 100.0f;
        float cx = bounds.X + bounds.Width / 2.0f;
        float cy = bounds.Y + bounds.Height / 2.0f;

        // 1. Concentric Soundwaves
        using (Pen wavePen1 = new Pen(Color.FromArgb(90, cLight), Math.Max(1.2f, scale * 1.5f)))
        using (Pen wavePen2 = new Pen(Color.FromArgb(50, cLight), Math.Max(1.0f, scale * 1.2f)))
        {
            g.DrawArc(wavePen1, cx - 25 * scale, cy - 30 * scale, 50 * scale, 35 * scale, 200, 140);
            g.DrawArc(wavePen2, cx - 35 * scale, cy - 38 * scale, 70 * scale, 48 * scale, 200, 140);
        }

        // 2. Trunk & Deep Roots
        RectangleF trunkRect = new RectangleF(cx - 20 * scale, cy - 10 * scale, 40 * scale, 40 * scale);
        using (LinearGradientBrush trunkBrush = new LinearGradientBrush(trunkRect, cLight, cMid, LinearGradientMode.Vertical))
        {
            GraphicsPath trunkPath = new GraphicsPath();
            trunkPath.AddBezier(
                new PointF(cx - 3 * scale, cy + 5 * scale),
                new PointF(cx - 10 * scale, cy + 18 * scale),
                new PointF(cx - 22 * scale, cy + 24 * scale),
                new PointF(cx - 28 * scale, cy + 26 * scale));
            trunkPath.AddLine(cx - 28 * scale, cy + 26 * scale, cx - 18 * scale, cy + 23 * scale);
            trunkPath.AddBezier(
                new PointF(cx - 18 * scale, cy + 23 * scale),
                new PointF(cx - 8 * scale, cy + 18 * scale),
                new PointF(cx - 2 * scale, cy + 12 * scale),
                new PointF(cx, cy + 25 * scale));
            trunkPath.AddBezier(
                new PointF(cx, cy + 25 * scale),
                new PointF(cx + 2 * scale, cy + 12 * scale),
                new PointF(cx + 8 * scale, cy + 18 * scale),
                new PointF(cx + 18 * scale, cy + 23 * scale));
            trunkPath.AddLine(cx + 18 * scale, cy + 23 * scale, cx + 28 * scale, cy + 26 * scale);
            trunkPath.AddBezier(
                new PointF(cx + 28 * scale, cy + 26 * scale),
                new PointF(cx + 22 * scale, cy + 24 * scale),
                new PointF(cx + 10 * scale, cy + 18 * scale),
                new PointF(cx + 3 * scale, cy + 5 * scale));

            trunkPath.AddBezier(
                new PointF(cx + 3 * scale, cy + 5 * scale),
                new PointF(cx + 14 * scale, cy - 8 * scale),
                new PointF(cx + 22 * scale, cy - 12 * scale),
                new PointF(cx + 15 * scale, cy - 10 * scale));
            trunkPath.AddBezier(
                new PointF(cx + 15 * scale, cy - 10 * scale),
                new PointF(cx + 6 * scale, cy - 6 * scale),
                new PointF(cx + 2 * scale, cy - 2 * scale),
                new PointF(cx, cy - 15 * scale));
            trunkPath.AddBezier(
                new PointF(cx, cy - 15 * scale),
                new PointF(cx - 2 * scale, cy - 2 * scale),
                new PointF(cx - 6 * scale, cy - 6 * scale),
                new PointF(cx - 15 * scale, cy - 10 * scale));
            trunkPath.AddBezier(
                new PointF(cx - 15 * scale, cy - 10 * scale),
                new PointF(cx - 22 * scale, cy - 12 * scale),
                new PointF(cx - 14 * scale, cy - 8 * scale),
                new PointF(cx - 3 * scale, cy + 5 * scale));

            trunkPath.CloseFigure();
            g.FillPath(trunkBrush, trunkPath);
        }

        // 3. Foliage & Leaves
        RectangleF leafRect = new RectangleF(cx - 35 * scale, cy - 35 * scale, 70 * scale, 40 * scale);
        using (LinearGradientBrush leafBrush = new LinearGradientBrush(leafRect, cLight, cDark, LinearGradientMode.Vertical))
        {
            DrawLeaf(g, leafBrush, cx, cy - 26 * scale, 8 * scale, 16 * scale, 0);
            DrawLeaf(g, leafBrush, cx - 14 * scale, cy - 22 * scale, 7 * scale, 14 * scale, -30);
            DrawLeaf(g, leafBrush, cx - 24 * scale, cy - 14 * scale, 7 * scale, 13 * scale, -55);
            DrawLeaf(g, leafBrush, cx - 26 * scale, cy - 2 * scale, 6 * scale, 11 * scale, -80);
            DrawLeaf(g, leafBrush, cx + 14 * scale, cy - 22 * scale, 7 * scale, 14 * scale, 30);
            DrawLeaf(g, leafBrush, cx + 24 * scale, cy - 14 * scale, 7 * scale, 13 * scale, 55);
            DrawLeaf(g, leafBrush, cx + 26 * scale, cy - 2 * scale, 6 * scale, 11 * scale, 80);
        }

        // 4. Memory Seed Nodes
        using (SolidBrush starBrush = new SolidBrush(cStar))
        {
            g.FillEllipse(starBrush, cx - 1.8f * scale, cy - 22 * scale, 3.6f * scale, 3.6f * scale);
            g.FillEllipse(starBrush, cx - 12 * scale, cy - 16 * scale, 3.0f * scale, 3.0f * scale);
            g.FillEllipse(starBrush, cx + 12 * scale, cy - 16 * scale, 3.0f * scale, 3.0f * scale);
            g.FillEllipse(starBrush, cx - 20 * scale, cy - 6 * scale, 2.5f * scale, 2.5f * scale);
            g.FillEllipse(starBrush, cx + 20 * scale, cy - 6 * scale, 2.5f * scale, 2.5f * scale);
        }
    }

    private static void DrawLeaf(Graphics g, Brush brush, float x, float y, float w, float h, float angle)
    {
        GraphicsState state = g.Save();
        g.TranslateTransform(x, y);
        g.RotateTransform(angle);

        GraphicsPath path = new GraphicsPath();
        path.AddBezier(0, -h / 2.0f, w / 2.0f, -h / 4.0f, w / 2.0f, h / 4.0f, 0, h / 2.0f);
        path.AddBezier(0, h / 2.0f, -w / 2.0f, h / 4.0f, -w / 2.0f, -h / 4.0f, 0, -h / 2.0f);
        path.CloseFigure();

        g.FillPath(brush, path);
        g.Restore(state);
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
}
