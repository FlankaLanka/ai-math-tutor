import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Group, Transformer, Rect } from 'react-konva';
import useImage from 'use-image';
import { PenIcon, ResetIcon } from './Icons';

/**
 * Whiteboard Component
 * Konva-based drawing tool with pen tool and problem image overlay
 */
const Whiteboard = forwardRef(function Whiteboard({ 
  problemImage = null // Base64 image URL of the problem (if uploaded)
}, ref) {
  const stageRef = useRef(null);
  const [penToolEnabled, setPenToolEnabled] = useState(true);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const imageGroupRef = useRef(null);
  const transformerRef = useRef(null);
  const lineRefs = useRef({});
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState({ x: 1, y: 1 });
  const [initialImagePosition, setInitialImagePosition] = useState({ x: 0, y: 0 });
  const [initialImageScale, setInitialImageScale] = useState({ x: 1, y: 1 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 450 });
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Load image using use-image hook
  const [image] = useImage(problemImage || '');

  // Initialize image position and scale when image loads
  useEffect(() => {
    if (image && stageRef.current) {
      const stage = stageRef.current;
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      
      // Calculate scale to fit (80% of canvas) - maintain aspect ratio initially
      let scaleX = 1;
      let scaleY = 1;
      const maxWidth = stageWidth * 0.8;
      const maxHeight = stageHeight * 0.8;
      if (image.width > maxWidth || image.height > maxHeight) {
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
        scaleX = scale;
        scaleY = scale;
      }
      
      // Center the image
      const scaledWidth = image.width * scaleX;
      const scaledHeight = image.height * scaleY;
      const centerX = (stageWidth - scaledWidth) / 2;
      const centerY = (stageHeight - scaledHeight) / 2;
      
      const position = { x: centerX, y: centerY };
      const scale = { x: scaleX, y: scaleY };
      setImagePosition(position);
      setImageScale(scale);
      setInitialImagePosition(position);
      setInitialImageScale(scale);
    }
  }, [image]);

  // Handle stage resize
  useEffect(() => {
    const updateStageSize = () => {
      if (stageRef.current) {
        const container = stageRef.current.container();
        if (container) {
          const rect = container.getBoundingClientRect();
          setStageSize({ width: rect.width, height: rect.height });
        }
      }
    };

    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    return () => window.removeEventListener('resize', updateStageSize);
  }, []);

  // Toggle pen tool
  const togglePenTool = () => {
    const newPenState = !penToolEnabled;
    setPenToolEnabled(newPenState);
    // Don't deselect on toggle - keep selection if switching modes
    if (isDrawing) {
      setIsDrawing(false);
    }
  };
  
  // Update transformer when a node is selected
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedNode) {
        // Handle imageGroupRef (direct ref) or line ref (wrapped in object)
        const node = selectedNode === imageGroupRef 
          ? imageGroupRef.current 
          : selectedNode.current;
        
        if (node) {
          transformerRef.current.nodes([node]);
          transformerRef.current.getLayer().batchDraw();
        }
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedNode]);

  // Handle mouse/touch down
  const handleMouseDown = (e) => {
    // Check if clicking on transformer handles
    if (transformerRef.current) {
      const transformer = transformerRef.current;
      
      // Check if clicking on transformer anchors
      if (transformer.nodes().length > 0) {
        // Allow transformer interaction
        return;
      }
    }
    
    // If pen is enabled, allow drawing anywhere (including over images)
    if (penToolEnabled) {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      
      setIsDrawing(true);
      const newLineId = `line-${Date.now()}-${Math.random()}`;
      // Points are stored in local coordinates relative to the Group
      // Initially Group is at (0,0) with scale (1,1), so local = global
      // For new line, first point is in local coords (which equals global initially)
      setLines([...lines, { 
        id: newLineId, 
        points: [pointerPos.x, pointerPos.y],
        // Store transform state with the line (Group's transform)
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1
      }]);
      return;
    }
    
    // If pen is disabled, handle selection
    const clickedOnImage = imageGroupRef.current && 
      (e.target === imageGroupRef.current || 
       e.target.getParent() === imageGroupRef.current ||
       (e.target.getParent() && e.target.getParent().getParent() === imageGroupRef.current));
    
    // Check if clicking on a line
    const clickedLineRef = Object.values(lineRefs.current).find(ref => 
      ref && (e.target === ref || e.target.getParent() === ref ||
             (e.target.getParent() && e.target.getParent().getParent() === ref))
    );
    const clickedOnLine = !!clickedLineRef;
    
    // If pen is off and clicked on image, select it
    if (clickedOnImage && image) {
      setSelectedNode(imageGroupRef);
      return;
    }
    
    // If pen is off and clicked on a line, select it
    if (clickedOnLine && clickedLineRef) {
      setSelectedNode({ current: clickedLineRef });
      return;
    }
    
    // Deselect if clicking on empty space
    if (!clickedOnImage && !clickedOnLine) {
      setSelectedNode(null);
    }
  };

  // Handle mouse/touch move
  const handleMouseMove = (e) => {
    if (!isDrawing || !penToolEnabled) return;
    
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    if (lines.length === 0) return;
    
    const lastLine = lines[lines.length - 1];
    
    // Convert global stage coordinates to local coordinates relative to the Group
    // Formula: local = (global - position) / scale
    const localX = (pointerPos.x - (lastLine.x || 0)) / (lastLine.scaleX || 1);
    const localY = (pointerPos.y - (lastLine.y || 0)) / (lastLine.scaleY || 1);
    
    // Add point in local coordinates
    const updatedLine = {
      ...lastLine,
      points: lastLine.points.concat([localX, localY])
    };
    
    setLines([...lines.slice(0, -1), updatedLine]);
  };

  // Handle mouse/touch up
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Reset canvas
  const handleReset = () => {
    // Step 1: Clear all drawings
    setLines([]);
    lineRefs.current = {};
    
    // Step 2: Deselect everything
    setSelectedNode(null);
    
    // Step 3: Reset image to initial position and scale
    if (problemImage && imageGroupRef.current) {
      const node = imageGroupRef.current;
      node.position(initialImagePosition);
      node.scaleX(initialImageScale.x);
      node.scaleY(initialImageScale.y);
      setImagePosition(initialImagePosition);
      setImageScale(initialImageScale);
    }
  };

  // Helper function to compress/downscale image
  const compressImage = useCallback((dataURL, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataURL);
      };
      img.onerror = () => resolve(dataURL); // Return original if compression fails
      img.src = dataURL;
    });
  }, []);

  // Get canvas snapshot as base64 (compressed)
  const getSnapshot = useCallback(async () => {
    if (!stageRef.current) return null;
    
    const stage = stageRef.current;
    // Use lower pixelRatio (1 instead of 2) and compress the result
    const dataURL = stage.toDataURL({ pixelRatio: 1 });
    // Compress the image to reduce size
    const compressed = await compressImage(dataURL, 1200, 0.7);
    return compressed;
  }, [compressImage]);

  // Expose getSnapshot to parent via ref
  useImperativeHandle(ref, () => ({
    getSnapshot
  }), [getSnapshot]);

  return (
    <div className="w-full bg-gray-50 sketch-box p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Whiteboard</h3>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePenTool();
            }}
            className={`px-3 py-1.5 text-xs font-semibold sketch-border-sm sketch-shadow-sm transition-colors ${
              penToolEnabled 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title={penToolEnabled ? "Disable pen tool" : "Enable pen tool"}
          >
            <PenIcon className="w-4 h-4 inline mr-1" />
            <span>{penToolEnabled ? 'Pen On' : 'Pen Off'}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-xs font-semibold sketch-border-sm sketch-shadow-sm transition-colors"
            title="Reset: remove image and drawings, then place new image at starting position"
          >
            <ResetIcon className="w-4 h-4 inline mr-1" />
            <span>Reset</span>
          </button>
        </div>
      </div>
      <div className="relative">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          className="w-full aspect-video border-2 border-gray-300 rounded-lg bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
              fill="white"
            />
            
            {/* Problem image overlay - behind drawings so we can draw over it */}
            {image && (
              <Group
                ref={imageGroupRef}
                x={imagePosition.x}
                y={imagePosition.y}
                scaleX={imageScale.x}
                scaleY={imageScale.y}
                draggable={!penToolEnabled && selectedNode === imageGroupRef}
                listening={!penToolEnabled} // Disable listening when pen is enabled so clicks pass through
                onClick={() => {
                  if (!penToolEnabled) {
                    setSelectedNode(imageGroupRef);
                  }
                }}
                onDragEnd={(e) => {
                  setImagePosition({ x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  // Store independent X and Y scales
                  setImageScale({ x: scaleX, y: scaleY });
                  setImagePosition({ x: node.x(), y: node.y() });
                }}
              >
                <KonvaImage
                  image={image}
                  opacity={0.7}
                  width={image.width}
                  height={image.height}
                />
              </Group>
            )}
            
            {/* Drawing lines - each as a draggable/resizable group */}
            {lines.map((line, i) => {
              // Use callback ref to store ref
              const setLineRef = (node) => {
                if (node) {
                  lineRefs.current[line.id] = node;
                }
              };
              
              const lineRef = lineRefs.current[line.id];
              const isSelected = selectedNode && 
                (selectedNode === imageGroupRef ? false : selectedNode.current === lineRef);
              
              return (
                <Group
                  key={line.id || i}
                  ref={setLineRef}
                  x={line.x || 0}
                  y={line.y || 0}
                  scaleX={line.scaleX || 1}
                  scaleY={line.scaleY || 1}
                  draggable={!penToolEnabled && isSelected}
                  listening={!penToolEnabled || isSelected} // Only listen when pen is off or line is selected
                  onClick={(e) => {
                    e.cancelBubble = true;
                    if (!penToolEnabled && lineRef) {
                      setSelectedNode({ current: lineRef });
                    }
                  }}
                  onDragEnd={(e) => {
                    const node = e.target;
                    const newX = node.x();
                    const newY = node.y();
                    
                    // Update line's stored position
                    setLines(lines.map((l) => 
                      l.id === line.id 
                        ? { ...l, x: newX, y: newY }
                        : l
                    ));
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const newX = node.x();
                    const newY = node.y();
                    const newScaleX = node.scaleX();
                    const newScaleY = node.scaleY();
                    
                    // Simply update the transform - Konva handles scaling automatically
                    setLines(lines.map((l) => 
                      l.id === line.id 
                        ? { ...l, x: newX, y: newY, scaleX: newScaleX, scaleY: newScaleY }
                        : l
                    ));
                  }}
                >
                  <Line
                    points={line.points}
                    stroke="#333333"
                    strokeWidth={2}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation="source-over"
                  />
                </Group>
              );
            })}
            
            {/* Transformer for selected node (image or line) */}
            {!penToolEnabled && selectedNode && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit resize
                  if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotateEnabled={false}
                keepRatio={false}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
});

export default Whiteboard;
