import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/store";
import { getCurriculumForCourse } from "@/lib/course-curriculum";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = db.getCourse(id);

  if (!course) {
    return NextResponse.json(
      {
        id: "api.content.read",
        ver: "1.0",
        ts: new Date().toISOString(),
        params: {
          resmsgid: `res-${Date.now()}`,
          msgid: `msg-${Date.now()}`,
          status: "failed",
          err: "RESOURCE_NOT_FOUND",
          errmsg: `Course or Sunbird content with ID '${id}' was not found in Karmayogi Bharat registry.`
        },
        responseCode: "RESOURCE_NOT_FOUND",
        result: {}
      },
      { status: 404 }
    );
  }

  const curriculum = getCurriculumForCourse(course.title, course.provider, course.id);

  const children = curriculum.map((lesson, idx) => ({
    identifier: lesson.sunbirdContentId || `do_igot_${course.id}_c${idx + 1}`,
    name: lesson.title,
    description: lesson.overview,
    mimeType: "video/x-youtube",
    contentType: "Resource",
    resourceType: "Lesson",
    streamingUrl: lesson.videoUrl,
    duration: lesson.duration,
    index: idx + 1,
    statements: lesson.statements,
    keyTakeaways: lesson.keyTakeaways,
    status: "Live",
    license: "CC-BY-NC 4.0 - MoSPI / iGOT Karmayogi Bharat"
  }));

  const response = {
    id: "api.content.read",
    ver: "1.0",
    ts: new Date().toISOString(),
    params: {
      resmsgid: `res-${Date.now()}`,
      msgid: `msg-${Date.now()}`,
      status: "successful"
    },
    responseCode: "OK",
    result: {
      content: {
        identifier: course.externalId || `do_igot_${course.id}`,
        name: course.title,
        code: `org.sunbird.${course.id}`,
        description: course.description,
        mimeType: "application/vnd.ekstep.content-collection",
        contentType: "Course",
        primaryCategory: "Course",
        framework: "mospi-nsqf-v2",
        channel: "Karmayogi Bharat / MoSPI DIID",
        provider: course.provider.toUpperCase(),
        durationHours: course.durationHours,
        difficulty: course.difficulty,
        language: [course.language],
        qualityScore: course.qualityScore,
        sourceUrl: course.sourceUrl,
        leafNodesCount: children.length,
        modulesCount: children.length,
        modules: curriculum,
        children: children,
        streamingStreamActive: true,
        dataProvenance: "iGOT Karmayogi Bharat / Sunbird Telemetry API"
      }
    }
  };

  return NextResponse.json(response);
}
