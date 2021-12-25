$('tbody').sortable({
        items: "tr:not('.home')",
        placeholder: "ui-state-hightlight",
        update: async(event,ui) => {
            var ids = ui.item[0].id;
            console.log(ids);
            var url = "/admin/reorder";
            //$.post(url, {id: ids});
            $.ajax({
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                url: url,
                data: JSON.stringify({id: ids}),
            });
        }
    });