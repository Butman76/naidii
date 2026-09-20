/// <reference path="../pb_data/types.d.ts" />

// Одноразовый перенос уже существующего содержимого лендингов (обложка/
// логотип/видео на specialist_profiles и постеры в landing_posters —
// 1755000044/45, до введения модерации) в landing_items КАК УЖЕ
// ОДОБРЕННОЕ: раньше оно и так было публичным, а после введения модерации
// фронтенд читает только landing_items (web/src/lib/specialists.ts) —
// без переноса лендинги опустели бы.
//
// Это cron-задача (раз в минуту проверяет маркер), а не миграция: в JSVM миграций нет
// $filesystem (проверено локально — ReferenceError), а копировать файлы
// без него нельзя. Повторный запуск исключён файлом-маркером
// pb_data/landing_backfill_done: он пишется после первого прохода (даже
// частично неудачного — сбойные записи логируются и пропускаются, ничто не
// роняет сервер, старые поля/коллекцию не трогаем, так что ничего не
// теряется). Чтобы повторить перенос вручную — удалить маркер и
// перезапустить pb-naidii.service (но сначала удалить уже созданные
// landing_items, иначе будут дубли).
//
// Обработчики JSVM изолированы — внешние переменные внутри них не
// видны, поэтому всё определено прямо внутри обработчика. cron, а не
// onBootstrap/onServe: onServe в JS-хуках этой версии недоступен, а
// onBootstrap может отработать до применения миграции 1755000046 — cron
// стартует уже на поднятом сервере.

cronAdd("landing_backfill", "* * * * *", () => {
  try {
    const dataDir = $app.dataDir()
    const marker = dataDir + "/landing_backfill_done"

    let alreadyDone = false
    try {
      $os.stat(marker)
      alreadyDone = true
    } catch (_) {
      alreadyDone = false
    }

    if (!alreadyDone) {
      let copied = 0
      let failed = 0
      const items = $app.findCollectionByNameOrId("landing_items")
      const storageDir = dataDir + "/storage/"

      const addItem = (profileId, kind, values, sortOrder) => {
        try {
          const rec = new Record(items)
          rec.set("specialist_profile_id", profileId)
          rec.set("kind", kind)
          rec.set("moderation_status", "approved")
          if (sortOrder) rec.set("sort_order", sortOrder)
          for (const key in values) rec.set(key, values[key])
          $app.save(rec)
          copied++
        } catch (err) {
          failed++
          console.log("landing backfill: " + kind + " of " + profileId + " skipped: " + err)
        }
      }

      const profiles = $app.findRecordsByFilter(
        "specialist_profiles",
        "premium_cover_image != '' || premium_logo_image != '' || premium_video_url != ''",
        "",
        0,
        0
      )
      for (const p of profiles) {
        const coverName = p.getString("premium_cover_image")
        if (coverName) {
          try {
            addItem(p.id, "cover", {
              image: $filesystem.fileFromPath(storageDir + p.baseFilesPath() + "/" + coverName),
            })
          } catch (err) {
            failed++
            console.log("landing backfill: cover file of " + p.id + " skipped: " + err)
          }
        }
        const logoName = p.getString("premium_logo_image")
        if (logoName) {
          try {
            addItem(p.id, "logo", {
              image: $filesystem.fileFromPath(storageDir + p.baseFilesPath() + "/" + logoName),
            })
          } catch (err) {
            failed++
            console.log("landing backfill: logo file of " + p.id + " skipped: " + err)
          }
        }
        const videoUrl = p.getString("premium_video_url")
        if (videoUrl) addItem(p.id, "video", { video_url: videoUrl })
      }

      const posters = $app.findRecordsByFilter("landing_posters", "id != ''", "sort_order", 0, 0)
      for (const poster of posters) {
        const fileName = poster.getString("image")
        if (!fileName) continue
        try {
          addItem(
            poster.getString("specialist_profile_id"),
            "photo",
            {
              title: poster.getString("caption"),
              image: $filesystem.fileFromPath(storageDir + poster.baseFilesPath() + "/" + fileName),
            },
            poster.getInt("sort_order")
          )
        } catch (err) {
          failed++
          console.log("landing backfill: poster " + poster.id + " skipped: " + err)
        }
      }

      $os.writeFile(marker, "done", 0o644)
      console.log("landing backfill: copied " + copied + ", failed " + failed)
    }
  } catch (err) {
    console.log("landing backfill aborted: " + err)
  }

})
