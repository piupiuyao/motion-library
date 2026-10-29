// Step 3 · person matte: one grayscale mask frame per video frame (white = person).
//
//   swiftc -O scripts/matte.swift -o scripts/matte      (once; macOS 12+, no downloads)
//   scripts/matte IN.mp4 OUT_DIR [--mode subject|person] [--quality accurate|balanced|fast] [--scale 1] [--only 300,900]
//       -> OUT_DIR/000001.png ...  same frame count as IN.mp4 (--only: just those frame numbers, for testing)
//
// --mode combo (default): edges from the "lift subject" model (sharp hair), limited to a widened person-segmentation
//   shape so laptops, chairs and other foreground objects drop out. macOS 14+.
// --mode subject: lift-subject only (keeps every foreground object).
// --mode person: person segmentation only; faster, softer edges, can leave holes in clothing.
// Everything runs on the machine; nothing is downloaded or uploaded.
import AVFoundation
import CoreImage
import Foundation
import Vision

let args = CommandLine.arguments
guard args.count >= 3 else {
    print("usage: matte IN.mp4 OUT_DIR [--mode subject|person] [--quality accurate|balanced|fast] [--scale 1] [--only 1,2]")
    exit(1)
}
let inURL = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2])
var quality = VNGeneratePersonSegmentationRequest.QualityLevel.accurate
var scale: CGFloat = 1
var mode = "combo"
var only: Set<Int>? = nil
var i = 3
while i < args.count {
    if args[i] == "--quality", i + 1 < args.count {
        quality = ["fast": .fast, "balanced": .balanced][args[i + 1]] ?? .accurate
        i += 1
    } else if args[i] == "--scale", i + 1 < args.count {
        scale = CGFloat(Double(args[i + 1]) ?? 1)
        i += 1
    } else if args[i] == "--mode", i + 1 < args.count {
        mode = args[i + 1]
        i += 1
    } else if args[i] == "--only", i + 1 < args.count {
        only = Set(args[i + 1].split(separator: ",").compactMap { Int($0) })
        i += 1
    }
    i += 1
}
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let asset = AVURLAsset(url: inURL)
let track = asset.tracks(withMediaType: .video)[0]
let reader = try AVAssetReader(asset: asset)
let output = AVAssetReaderTrackOutput(track: track, outputSettings: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
])
reader.add(output)
reader.startReading()

let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = quality
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
let ctx = CIContext()
let size = track.naturalSize.applying(track.preferredTransform)
let outW = abs(size.width) * scale, outH = abs(size.height) * scale
let gray = CGColorSpaceCreateDeviceGray()
var n = 0
let t0 = Date()
func personMask(_ px: CVPixelBuffer) throws -> CIImage? {
    try VNImageRequestHandler(cvPixelBuffer: px, options: [:]).perform([request])
    guard let m = request.results?.first?.pixelBuffer else { return nil }
    return CIImage(cvPixelBuffer: m)
}

let subjectReq = VNGenerateForegroundInstanceMaskRequest()
func subjectMask(_ px: CVPixelBuffer) throws -> CIImage? {
    let h = VNImageRequestHandler(cvPixelBuffer: px, options: [:])
    try h.perform([subjectReq])
    guard let r = subjectReq.results?.first, !r.allInstances.isEmpty else { return nil }
    // full-resolution soft mask of every foreground instance
    let m = try r.generateScaledMaskForImage(forInstances: r.allInstances, from: h)
    return CIImage(cvPixelBuffer: m)
}

// person shape, holes filled and widened ~24px, soft edge: used as a "keep" zone for the subject mask
func keepZone(_ person: CIImage, _ w: CGFloat, _ h: CGFloat) -> CIImage {
    let p = person.transformed(by: CGAffineTransform(scaleX: w / person.extent.width, y: h / person.extent.height))
    let boosted = p.applyingFilter("CIColorMatrix", parameters: [
        "inputRVector": CIVector(x: 6, y: 0, z: 0, w: 0), "inputGVector": CIVector(x: 0, y: 6, z: 0, w: 0),
        "inputBVector": CIVector(x: 0, y: 0, z: 6, w: 0), "inputBiasVector": CIVector(x: -0.6, y: -0.6, z: -0.6, w: 0),
    ]).applyingFilter("CIColorClamp")
    return boosted.applyingFilter("CIMorphologyMaximum", parameters: ["inputRadius": 24])
        .applyingFilter("CIGaussianBlur", parameters: ["inputRadius": 8]).cropped(to: CGRect(x: 0, y: 0, width: w, height: h))
}

while let sample = output.copyNextSampleBuffer(), let px = CMSampleBufferGetImageBuffer(sample) {
    n += 1
    if let o = only, !o.contains(n) { continue }
    let url = outDir.appendingPathComponent(String(format: "%06d.png", n))
    var mask: CIImage?
    switch mode {
    case "person": mask = try personMask(px)
    case "subject": mask = try subjectMask(px)
    default:
        if let sub = try subjectMask(px), let per = try personMask(px) {
            let zone = keepZone(per, sub.extent.width, sub.extent.height)
            mask = sub.applyingFilter("CIMultiplyCompositing", parameters: [kCIInputBackgroundImageKey: zone]).cropped(to: sub.extent)
        }
    }
    guard var img = mask else {
        // nobody in frame: write an empty mask so frame numbers stay aligned
        try ctx.writePNGRepresentation(of: CIImage(color: .black).cropped(to: CGRect(x: 0, y: 0, width: outW, height: outH)),
                                       to: url, format: .L8, colorSpace: gray)
        continue
    }
    img = img.transformed(by: CGAffineTransform(scaleX: outW / img.extent.width, y: outH / img.extent.height))
    try ctx.writePNGRepresentation(of: img, to: url, format: .L8, colorSpace: gray)
    if n % 150 == 0 { print("  \(n) frames  \(Int(Date().timeIntervalSince(t0)))s") }
}
print("matte: \(n) frames -> \(outDir.path)")
